import React from 'react';
import ReactEcharts, { EChartsOption } from "echarts-for-react";

export interface Category {
  name: string,
  index: number
}

export interface GraphData {
  id: string,
  name: string,
  value: string,
  category: number
}

export interface GraphLink {
  source: string,
  target: string
}

// Define the options for the echarts component
function getOption(nodes: GraphData[], edges: GraphLink[], categories: Category[]) {
  return {
    tooltip: {
      position: 'right',
    },
    legend: [
      {
        data: categories.map(function (c) {
          return c.name;
        })
      }
    ],
    series: [
      {
        type: "graph",
        layout: "force",
        draggable: true,
        label: {
          position: 'center',
          show: true,
          formatter: '{b}',         
        },
        nodes: nodes,
        edges: edges,
        categories: categories,
        emphasis: {
          focus: 'adjacency',
          label: {
            position: 'left',
            show: true
          }
        },
        roam: true,
        lineStyle: {
          width: 3.0,
          curveness: 0.2,
        },
        dagreLayout: {
          rankdir: 'LR', // Left to right layout
          nodesepFunc: () => 1, // Node separation function
          ranksepFunc: () => 1, // Rank separation function
        },
      },
    ],
  };
};

export function DirectedGraph(
  props: {
    nodes: GraphData[],
    edges: GraphLink[],
    categories: Category[],
    onChartClick: (id: number) => Promise<[Category[], GraphData[], GraphLink[]]>
  }) {

  // let [nodes, setNodes] = React.useState<GraphData[]>(props.data)
  // let [edges, setEdges] = React.useState<GraphLink[]>(props.links)
  // let [categories, setCategories] = React.useState<Category[]>(props.categories)

  // let onEvents: { echartRef: any, click: (params: any) => void } = {
  //   echartRef: null,
  //   click: async (params: any) => {
  //     let [newCategories, newNodes, newEdges] = await props.onChartClick(parseInt(params.data.id))
      
  //     setNodes([...nodes, ...newNodes]);
  //     setEdges([...edges, ...newEdges]);
  //   }
  // }

  // return (<ReactEcharts ref={(e) => { onEvents.echartRef = e }} option={getOption(nodes, edges, categories)} onEvents={onEvents} />)
  return (<ReactEcharts className="border" option={getOption(props.nodes, props.edges, props.categories)} />)
}
