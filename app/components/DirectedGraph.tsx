import React, { useRef } from 'react';
import ReactEcharts, { EChartsInstance } from "echarts-for-react";

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

    toolbox: {
      show: true,
      feature: {
        restore: {},
        saveAsImage: {}
      }
    },
    series: [
      {
        nodes,
        edges,
        categories,

        type: "graph",
        layout: "force",
        force: {
          edgeLength: 70,
          repulsion: 150,
          gravity: 0.1
        },
        draggable: true,
        label: {
          position: 'center',
          show: true,
          formatter: '{b}',
        },
        emphasis: {
          focus: 'adjacency',
          label: {
            position: 'right',
            show: true
          }
        },
        roam: true,
        lineStyle: {
          color: 'source',
          width: 3.0,
          curveness: 0.1,
          opacity: 0.7
        },
        symbolSize: 30,
      },
    ],
  };
};

export function DirectedGraph(
  props: {
    nodes: Map<number, GraphData>,
    edges: Set<GraphLink>,
    categories: Map<String, Category>,
    onChartClick: (id: number) => Promise<[Map<String, Category>, Map<number, GraphData>, Set<GraphLink>]>
  }) {
  const echartRef = useRef<EChartsInstance | null>(null)

  const nodes = Array.from(props.nodes.values())
  const edges = Array.from(props.edges.values())
  const categories = Array.from(props.categories.values())

  let options = getOption(nodes, edges, categories)

  let onEvents: { dblclick: (params: any) => void } = {
    dblclick: async (params: any) => {
      let [newCategories, newNodes, newEdges] = await props.onChartClick(parseInt(params.data.id))

      let newCategoriesArray = new Array<Category>(newCategories.size)
      newCategories.forEach((category) => {
        newCategoriesArray[category.index] = category
      })

      newNodes.forEach((node, id) => {
        if (!props.nodes.get(id)) {

          // Check if category already exists in categories otherwise add it
          let newCategory = newCategoriesArray[node.category]
          let category = props.categories.get(newCategory.name)

          if(category) {
            node.category = category.index
          } else {
            newCategory.index = categories.length
            node.category = newCategory.index
            props.categories.set(newCategory.name, newCategory)
            categories.push(newCategory)
          }

          // Add the node to the nodes map and array
          props.nodes.set(parseInt(node.id), node)
          nodes.push(node)
        }
      })

      newEdges.forEach((edge) => {
        if (!props.edges.has(edge)) {
          props.edges.add(edge)
          edges.push(edge)
        }
      })

      echartRef.current?.setOption({
        legend: [
          {
            data: categories.map(function (c) {
              return c.name;
            })
          }
        ],
        series: [
          {
            nodes,
            edges,
            categories,
          }

        ]
      })
    }
  }

  return (
    <ReactEcharts
      style={{ height: "50vh"}}
      className="border"
      option={options}
      onEvents={onEvents}
      onChartReady={
        (e) => { echartRef.current = e }
      }
    />
  )
}
