import { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import type { GraphData, GraphNode, GraphLink, DomainKey } from '../../types';
import { DOMAINS } from '../../lib/domainClassifier';

interface Props {
  graphData: GraphData;
  selectedNode: GraphNode | null;
  searchQuery: string;
  selectedLanguage: string;
  onSelectNode: (node: GraphNode | null) => void;
}

// Evenly-spaced points on a sphere via Fibonacci lattice
function fibSphere(total: number, idx: number, radius: number): [number, number, number] {
  const golden = (1 + Math.sqrt(5)) / 2;
  const theta = Math.acos(1 - (2 * (idx + 0.5)) / total);
  const phi = (2 * Math.PI * idx) / golden;
  return [
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.sin(theta) * Math.sin(phi),
    radius * Math.cos(theta),
  ];
}

// Pre-compute centroid for each domain key — spread around a sphere
const DOMAIN_KEYS = Object.keys(DOMAINS) as DomainKey[];
const DOMAIN_CENTROIDS: Record<string, [number, number, number]> = {};
DOMAIN_KEYS.forEach((k, i) => {
  DOMAIN_CENTROIDS[k] = fibSphere(DOMAIN_KEYS.length, i, 180);
});

function createGlowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.6)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.15)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function nodeId(n: string | GraphNode): string {
  return typeof n === 'string' ? n : n.id;
}

function linkKey(l: GraphLink): string {
  return [nodeId(l.source), nodeId(l.target)].sort().join('|||');
}

function domainGlowColor(node: GraphNode): string {
  const primaryDomain = (node as any).primaryDomain as DomainKey | null;
  if (primaryDomain && DOMAINS[primaryDomain]) return DOMAINS[primaryDomain].color;
  return node.color;
}

function buildHoverLabel(node: GraphNode): string {
  const parts: string[] = [node.name];
  const domains = node.domains ?? [];
  if (domains.length > 0) {
    parts.push(domains.map((d) => `${DOMAINS[d]?.icon ?? ''} ${DOMAINS[d]?.name ?? d}`).join('  ·  '));
  }
  const topics = node.repo?.topics ?? [];
  if (topics.length > 0) {
    parts.push(topics.slice(0, 6).join(', '));
  }
  return parts.join('\n');
}

export default function GraphCanvas({
  graphData,
  selectedNode,
  searchQuery,
  selectedLanguage,
  onSelectNode,
}: Props) {
  const fgRef = useRef<any>(null);
  const glowTexture = useRef<THREE.Texture | null>(null);
  const nodeMaterials = useRef<Map<string, THREE.MeshPhongMaterial>>(new Map());
  const domainGlowMaterials = useRef<Map<string, THREE.SpriteMaterial>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>());
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>());

  useEffect(() => {
    glowTexture.current = createGlowTexture();
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setDimensions({ width: e.contentRect.width, height: e.contentRect.height });
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Zoom to fit after graph settles
  useEffect(() => {
    if (graphData.nodes.length > 0 && fgRef.current) {
      const t = setTimeout(() => fgRef.current?.zoomToFit(1200, 60), 1500);
      return () => clearTimeout(t);
    }
  }, [graphData.nodes.length]);

  // Domain clustering force + repulsion
  useEffect(() => {
    if (!fgRef.current) return;

    const repoNodes = graphData.nodes.filter((n) => n.nodeType === 'repo' || !n.nodeType);

    // Strong repulsion so nodes spread out
    fgRef.current.d3Force('charge')?.strength(-180);
    fgRef.current.d3Force('link')?.distance(60).strength(0.3);

    // Custom domain clustering force — pulls each repo toward its domain centroid
    fgRef.current.d3Force('domainCluster', (alpha: number) => {
      for (const node of repoNodes) {
        const n = node as any;
        const primaryDomain = (node as any).primaryDomain as DomainKey | null;
        if (!primaryDomain) continue;
        const [cx, cy, cz] = DOMAIN_CENTROIDS[primaryDomain] ?? [0, 0, 0];
        const dx = cx - (n.x ?? 0);
        const dy = cy - (n.y ?? 0);
        const dz = cz - (n.z ?? 0);
        const strength = alpha * 0.08;
        n.vx = (n.vx ?? 0) + dx * strength;
        n.vy = (n.vy ?? 0) + dy * strength;
        n.vz = (n.vz ?? 0) + dz * strength;
      }
    });
  }, [graphData.nodes]);

  // Clear material refs on data change
  useEffect(() => {
    nodeMaterials.current.clear();
    domainGlowMaterials.current.clear();
  }, [graphData]);

  const filteredNodes = useCallback((): Set<string> => {
    const q = searchQuery.toLowerCase().trim();
    const lang = selectedLanguage;
    if (!q && !lang) return new Set();
    return new Set(
      graphData.nodes
        .filter((n) => {
          if (n.isFileNode) return false;
          const matchLang = !lang || n.repo?.language === lang;
          const matchSearch =
            !q ||
            n.name.toLowerCase().includes(q) ||
            (n.repo?.description ?? '').toLowerCase().includes(q) ||
            (n.repo?.topics ?? []).some((t) => t.includes(q));
          return matchLang && matchSearch;
        })
        .map((n) => n.id)
    );
  }, [graphData.nodes, searchQuery, selectedLanguage]);

  const updateMaterials = useCallback((highlighted: Set<string>, filtered: Set<string>) => {
    nodeMaterials.current.forEach((mat, id) => {
      const inFilter = filtered.size === 0 || filtered.has(id);
      const inHighlight = highlighted.size === 0 || highlighted.has(id);
      const visible = inFilter && inHighlight;
      mat.opacity = visible ? 1 : inFilter ? 0.06 : 0.02;
      mat.emissiveIntensity = visible ? 0.7 : 0.04;
      mat.needsUpdate = true;
    });
    domainGlowMaterials.current.forEach((mat, id) => {
      const inFilter = filtered.size === 0 || filtered.has(id);
      const inHighlight = highlighted.size === 0 || highlighted.has(id);
      mat.opacity = inFilter && inHighlight ? 0.45 : 0.01;
      mat.needsUpdate = true;
    });
  }, []);

  useEffect(() => {
    updateMaterials(highlightNodes, filteredNodes());
  }, [searchQuery, selectedLanguage, filteredNodes, highlightNodes, updateMaterials]);

  const handleNodeHover = useCallback(
    (node: any) => {
      if (!node) {
        setHighlightNodes(new Set());
        setHighlightLinks(new Set());
        updateMaterials(new Set(), filteredNodes());
        return;
      }
      const gn = node as GraphNode;
      if (gn.isFileNode) return;
      const newNodes = new Set<string>([gn.id]);
      const newLinks = new Set<string>();
      graphData.links.forEach((link) => {
        if (link.isFileLink) return;
        const src = nodeId(link.source);
        const tgt = nodeId(link.target);
        if (src === gn.id || tgt === gn.id) {
          newNodes.add(src);
          newNodes.add(tgt);
          newLinks.add(linkKey(link));
        }
      });
      setHighlightNodes(newNodes);
      setHighlightLinks(newLinks);
      updateMaterials(newNodes, filteredNodes());
    },
    [graphData.links, filteredNodes, updateMaterials]
  );

  const handleNodeClick = useCallback(
    (node: any) => {
      const gn = node as GraphNode;
      if (gn.isFileNode) {
        if (gn.fileUrl) window.open(gn.fileUrl, '_blank', 'noopener');
        return;
      }
      onSelectNode(selectedNode?.id === gn.id ? null : gn);
      if (fgRef.current) {
        const { x = 0, y = 0, z = 0 } = gn;
        fgRef.current.cameraPosition({ x: x + 80, y: y + 30, z: z + 100 }, { x, y, z }, 800);
      }
    },
    [selectedNode, onSelectNode]
  );

  const nodeThreeObject = useCallback(
    (node: any): THREE.Object3D => {
      const gn = node as GraphNode;

      // File nodes: small, simple
      if (gn.isFileNode) {
        const color = new THREE.Color(gn.color);
        const size = gn.fileType === 'dir' ? 2.2 : 1.4;
        const mat = new THREE.MeshPhongMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.4,
          transparent: true,
          opacity: 0.75,
          shininess: 60,
        });
        nodeMaterials.current.set(gn.id, mat);
        const shape = gn.fileType === 'dir'
          ? new THREE.OctahedronGeometry(size, 0)
          : new THREE.SphereGeometry(size, 8, 8);
        return new THREE.Mesh(shape, mat);
      }

      // Repo nodes: core sphere + language glow + domain-colored outer glow
      const langColor = new THREE.Color(gn.color);
      const glowColor = new THREE.Color(domainGlowColor(gn));
      const size = Math.max(3, Math.cbrt(gn.val) * 3.5);
      const group = new THREE.Group();

      // Core sphere (language color)
      const coreMat = new THREE.MeshPhongMaterial({
        color: langColor,
        emissive: langColor,
        emissiveIntensity: 0.7,
        transparent: true,
        opacity: 1,
        shininess: 120,
      });
      nodeMaterials.current.set(gn.id, coreMat);
      group.add(new THREE.Mesh(new THREE.SphereGeometry(size, 20, 20), coreMat));

      // Translucent shell (language color)
      group.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(size * 1.6, 16, 16),
          new THREE.MeshPhongMaterial({ color: langColor, transparent: true, opacity: 0.08, side: THREE.BackSide })
        )
      );

      // Soft inner glow (language color)
      if (glowTexture.current) {
        const innerGlow = new THREE.SpriteMaterial({
          map: glowTexture.current,
          color: langColor,
          transparent: true,
          opacity: 0.25,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const innerSprite = new THREE.Sprite(innerGlow);
        innerSprite.scale.set(size * 5, size * 5, 1);
        group.add(innerSprite);
      }

      // Domain-colored outer glow — makes the cluster color visible from a distance
      if (glowTexture.current) {
        const domainSpriteMat = new THREE.SpriteMaterial({
          map: glowTexture.current,
          color: glowColor,
          transparent: true,
          opacity: 0.45,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        domainGlowMaterials.current.set(gn.id, domainSpriteMat);
        const domainSprite = new THREE.Sprite(domainSpriteMat);
        domainSprite.scale.set(size * 10, size * 10, 1);
        group.add(domainSprite);
      }

      return group;
    },
    // glowTexture is a ref, stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const getLinkColor = useCallback(
    (link: any): string => {
      const l = link as GraphLink;
      if (l.isFileLink) {
        return highlightNodes.size > 0 && highlightNodes.has(nodeId(l.source))
          ? 'rgba(99,102,241,0.5)'
          : 'rgba(99,102,241,0.12)';
      }
      const key = linkKey(l);
      if (highlightLinks.has(key)) return 'rgba(255,255,255,0.85)';
      if (highlightLinks.size === 0) return 'rgba(255,255,255,0.12)';
      return 'rgba(255,255,255,0.02)';
    },
    [highlightLinks, highlightNodes]
  );

  const getLinkWidth = useCallback(
    (link: any): number => {
      const l = link as GraphLink;
      if (l.isFileLink) return 0.4;
      return highlightLinks.has(linkKey(l)) ? 2 : 0.6;
    },
    [highlightLinks]
  );

  const getLinkParticles = useCallback(
    (link: any): number => {
      const l = link as GraphLink;
      if (l.isFileLink) return 0;
      return highlightLinks.has(linkKey(l)) ? 3 : 0;
    },
    [highlightLinks]
  );

  return (
    <div ref={containerRef} className="absolute inset-0 force-graph-container">
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#040816"
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        nodeLabel={(node: any) => buildHoverLabel(node as GraphNode)}
        nodeRelSize={1}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        linkColor={getLinkColor}
        linkWidth={getLinkWidth}
        linkOpacity={1}
        linkDirectionalParticles={getLinkParticles}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleColor={() => 'rgba(255,255,255,0.9)'}
        showNavInfo={false}
        enableNodeDrag={false}
        d3AlphaDecay={0.012}
        d3VelocityDecay={0.3}
        cooldownTicks={400}
      />
    </div>
  );
}
