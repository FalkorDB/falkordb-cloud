import React from 'react';
import ReactEcharts, { EChartsOption } from "echarts-for-react";

export interface Category {
  name: string,
  index: number
}

export interface GraphData {
  id: string,
  name: string,
  value: string
  category: number
}

export interface GraphLink {
  source: string,
  target: string
}

export function DirectedGraph(props: { data: GraphData[], links: GraphLink[], categories: Category[] }) {

  // Define the options for the echarts component
  function getOption(): EChartsOption {
    return {
      tooltip: {},
      legend: [
        {
          data: props.categories.map(function (c) {
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
            position: 'right',
            formatter: '{b}'
          },
          data: props.data,
          links: props.links,
          categories: props.categories,
          roam: true,
          dagreLayout: {
            rankdir: 'LR', // Left to right layout
            nodesepFunc: () => 1, // Node separation function
            ranksepFunc: () => 1, // Rank separation function
          },
        },
      ],
    };
  };

  return (
    <ReactEcharts option={getOption()} />
  )
}