// components/WeaponsGraph.tsx
"use client";
import {
  FigureOne,
  FigureThree,
  FigureTwo,
  GraphSequence,
  type GraphNode,
} from "@/components/player";
import { WeaponStats } from "@/types";

interface TransformedWeaponData {
  title: string;
  rows: Array<{
    key: string;
    label: string;
    value: number;
  }>;
}

export const WeaponsGraph = ({ data }: { data: TransformedWeaponData[] }) => {
  const graphSequenceManual: GraphNode[] = [
    // Первый цикл паттерна (3 фигуры)
    {
      index: 0,
      direction: "down",
      length: 220,
      hasBranch: true,
      branchSide: "right",
      branchLength: 120,
      children: ({ x, y }: { x: number; y: number }) =>
        data[0] && (
          <FigureOne
            x={x}
            y={y}
            color="white"
            title={data[0].title}
            rows={data[0].rows}
          />
        ),
    },
    {
      index: 1,
      direction: "down-left",
      length: 100,
      hasBranch: true,
      branchSide: "left",
      branchLength: 100,
      children: ({ x, y }: { x: number; y: number }) =>
        data[1] && (
          <FigureTwo
            x={x}
            y={y}
            color="white"
            title={data[1].title}
            rows={data[1].rows}
          />
        ),
    },
    {
      index: 1,
      direction: "down",
      length: 150,
      hasBranch: false,
    },
    {
      index: 2,
      direction: "down-right",
      length: 200,
      hasBranch: true,
      branchSide: "right",
      branchLength: 90,
      children: ({ x, y }: { x: number; y: number }) =>
        data[2] && (
          <FigureThree
            x={x}
            y={y}
            color="white"
            title={data[2].title}
            rows={data[2].rows}
          />
        ),
    },
    {
      index: 2,
      direction: "down",
      length: 100,
      hasBranch: false,
    },
    // Второй цикл паттерна (еще 2 фигуры)
    {
      index: 3,
      direction: "down",
      length: 180,
      hasBranch: true,
      branchSide: "right",
      branchLength: 110,
      children: ({ x, y }: { x: number; y: number }) =>
        data[3] && (
          <FigureOne
            x={x}
            y={y}
            color="white"
            title={data[3].title}
            rows={data[3].rows}
          />
        ),
    },
    {
      index: 4,
      direction: "down-left",
      length: 120,
      hasBranch: true,
      branchSide: "left",
      branchLength: 95,
      children: ({ x, y }: { x: number; y: number }) =>
        data[4] && (
          <FigureTwo
            x={x}
            y={y}
            color="white"
            title={data[4].title}
            rows={data[4].rows}
          />
        ),
    },
    {
      index: 4,
      direction: "down",
      length: 140,
      hasBranch: false,
    },
    // Третий цикл паттерна (еще 2 фигуры)
    {
      index: 5,
      direction: "down-right",
      length: 190,
      hasBranch: true,
      branchSide: "right",
      branchLength: 105,
      children: ({ x, y }: { x: number; y: number }) =>
        data[5] && (
          <FigureThree
            x={x}
            y={y}
            color="white"
            title={data[5].title}
            rows={data[5].rows}
          />
        ),
    },
    {
      index: 5,
      direction: "down",
      length: 130,
      hasBranch: false,
    },
    {
      index: 6,
      direction: "down-left",
      length: 160,
      hasBranch: true,
      branchSide: "left",
      branchLength: 100,
      children: ({ x, y }: { x: number; y: number }) =>
        data[6] && (
          <FigureOne
            x={x}
            y={y}
            color="white"
            title={data[6].title}
            rows={data[6].rows}
          />
        ),
    },
  ];
  const showData = graphSequenceManual.filter(
    (node) => data.length > node.index
  ); // Фильтру
  console.log(showData);

  const headerStyle: React.CSSProperties = {
    textAlign: "center" as const,
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "40px",
    paddingTop: "30px",
    textTransform: "uppercase",
    letterSpacing: "3px",
  };

  const graphContainerStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
    margin: "0 auto",
    border: "none",
  };

  const infoStyle: React.CSSProperties = {
    textAlign: "center" as const,
    fontSize: "12px",
    color: "#666666",
    marginTop: "30px",
    fontFamily: "'Courier New', monospace",
  };

  return (
    <div className="h-fit mx-auto relative w-full">
      <div style={headerStyle}>Weapon Distribution Graph with Figures</div>
      <div style={infoStyle}>SYSTEM_GRAPH_VIEW // BRANCH_FIGURES_ENABLED</div>

      <div style={graphContainerStyle} className="h-fit">
        <GraphSequence
          sequence={showData}
          currentIndex={0}
          startX={900}
          startY={50}
          baseLength={160}
        />
      </div>

      <div style={infoStyle}>
        {`// Branch Figures Active | Total Nodes: ${showData.length}`}
      </div>
    </div>
  );
};
