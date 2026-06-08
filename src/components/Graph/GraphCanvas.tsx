import { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';
import type { GraphData, GraphNode, GraphLink } from '../../types';
import { DOMAINS } from '../../lib/domainClassifier';

interface Props {
  graphData: GraphData;
  selectedNode: GraphNode | null;
  searchQuery: string;
  selectedLanguage: string;
  onSelectNode: (node: GraphNode | null) => void;
}

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
  const glowMaterials = useRef<Map<string, THREE.SpriteMaterial>>(new Map());
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

  // Auto-zoom after graph settles
  useEffect(() => {
    if (graphData.nodes.length > 0 && fgRef.current) {
      const t = setTimeout(() => fgRef.current?.zoomToFit(1200, 80), 1200);
      return () => clearTimeout(t);
    }
  }, [graphData.nodes.length]);

  // Language clustering force: same-language repo nodes are attracted to each other
  useEffect(() => {
    if (!fgRef.current) return;
    const repoNodes = graphData.nodes.filter((n) => !n.isFileNode);

    fgRef.current.d3Force('cluster', (alpha: number) => {
      for (let i = 0; i < repoNodes.length; i++) {
        for (let j = i + 1; j < repoNodes.length; j++) {
          const a = repoNodes[i] as any;
          const b = repoNodes[j] as any;
          if (repoNodes[i].group !== repoNodes[j].group || repoNodes[i].group === 'Other') continue;
          const dx = (b.x ?? 0) - (a.x ?? 0);
          const dy = (b.y ?? 0) - (a.y ?? 0);
          const dz = (b.z ?? 0) - (a.z ?? 0);
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
          const strength = alpha * 0.06;
          a.vx = (a.vx ?? 0) + (dx / dist) * strength;
          a.vy = (a.vy ?? 0) + (dy / dist) * strength;
          a.vz = (a.vz ?? 0) + (dz / dist) * strength;
          b.vx = (b.vx ?? 0) - (dx / dist) * strength;
          b.vy = (b.vy ?? 0) - (dy / dist) * strength;
          b.vz = (b.vz ?? 0) - (dz / dist) * strength;
        }
      }
    });
  }, [graphData.nodes]);

  // Clear material refs on data change
  useEffect(() => {
    nodeMaterials.current.clear();
    glowMaterials.current.clear();
  }, [graphData]);

  const updateMaterials = useCallback((highlighted: Set<string>, filtered: Set<string>) => {
    nodeMaterials.current.forEach((mat, id) => {
      const inFilter = filtered.size === 0 || filtered.has(id);
      const inHighlight = highlighted.size === 0 || highlighted.has(id);
      const visible = inFilter && inHighlight;
      mat.opacity = visible ? 1 : inFilter ? 0.06 : 0.02;
      mat.emissiveIntensity = visible ? 0.7 : 0.04;
      mat.needsUpdate = true;
    });
    glowMaterials.current.forEach((mat, id) => {
      const inFilter = filtered.size === 0 || filtered.has(id);
      const inHighlight = highlighted.size === 0 || highlighted.has(id);
      mat.opacity = inFilter && inHighlight ? 0.5 : 0.01;
      mat.needsUpdate = true;
    });
  }, []);

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
      if (gn.isFileNode) return; // don't highlight on file node hover
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
        // Open file in GitHub
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

  const nodeThreeObject = useCallback((node: any): THREE.Object3D => {
    const gn = node as GraphNode;
    const color = new THREE.Color(gn.color);

    // File nodes: small, no glow
    if (gn.isFileNode) {
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

    // Repo nodes: glowing spheres
    const size = Math.max(3, Math.cbrt(gn.val) * 3.5);
    const group = new THREE.Group();

    const coreMat = new THREE.MeshPhongMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 1,
      shininess: 120,
    });
    nodeMaterials.current.set(gn.id, coreMat);
    group.add(new THREE.Mesh(new THREE.SphereGeometry(size, 20, 20), coreMat));

    group.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(size * 1.6, 16, 16),
        new THREE.MeshPhongMaterial({ color, transparent: true, opacity: 0.1, side: THREE.BackSide })
      )
    );

    if (glowTexture.current) {
      const spriteMat = new THREE.SpriteMaterial({
        map: glowTexture.current,
        color,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      glowMaterials.current.set(gn.id, spriteMat);
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(size * 7, size * 7, 1);
      group.add(sprite);
    }

    return group;
  }, []);

  const getLinkColor = useCallback(
    (link: any): string => {
      const l = link as GraphLink;

      if (l.isFileLink) {
        return highlightNodes.size > 0 && highlightNodes.has(nodeId(l.source))
          ? 'rgba(99,102,241,0.45)'
          : 'rgba(99,102,241,0.12)';
      }

      const key = linkKey(l);
      const isHighlighted = highlightLinks.has(key);

      // Default (no hover) — tint by link type so graph shows structure
      if (highlightLinks.size === 0) {
        if (l.type === 'topic') return 'rgba(165,180,252,0.22)';        // indigo — explicit tags
        if (l.type === 'domain') {
          const domainColor = l.sharedItems?.[0] ? DOMAINS[l.sharedItems[0] as keyof typeof DOMAINS]?.color : null;
          return domainColor ? `${domainColor}30` : 'rgba(255,255,255,0.1)';
        }
        if (l.type === 'dependency') return 'rgba(251,191,36,0.15)';   // amber — shared code
        if (l.type === 'time') return 'rgba(255,255,255,0.04)';         // nearly invisible
        if (l.type === 'fork') return 'rgba(52,211,153,0.25)';          // green
        return 'rgba(255,255,255,0.06)';
      }

      // Hover: highlighted links pop with type color
      if (isHighlighted) {
        if (l.type === 'topic') return 'rgba(165,180,252,0.85)';
        if (l.type === 'domain') {
          const domainColor = l.sharedItems?.[0] ? DOMAINS[l.sharedItems[0] as keyof typeof DOMAINS]?.color : null;
          return domainColor ? `${domainColor}dd` : 'rgba(255,255,255,0.7)';
        }
        if (l.type === 'dependency') return 'rgba(251,191,36,0.9)';
        if (l.type === 'fork') return 'rgba(52,211,153,0.9)';
        return 'rgba(255,255,255,0.7)';
      }

      return 'rgba(255,255,255,0.012)'; // dimmed non-highlighted
    },
    [highlightLinks, highlightNodes]
  );

  const getLinkWidth = useCallback(
    (link: any): number => {
      const l = link as GraphLink;
      if (l.isFileLink) return 0.4;
      return highlightLinks.has(linkKey(l)) ? 1.5 : 0.5;
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
        nodeLabel={(node: any) => (node as GraphNode).name}
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
        d3AlphaDecay={0.015}
        d3VelocityDecay={0.25}
        cooldownTicks={300}
      />
    </div>
  );
}
