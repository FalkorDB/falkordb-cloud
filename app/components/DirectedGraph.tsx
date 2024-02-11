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

export class GraphLink {
  private source: string;
  private target: string;
  private type: string;

  constructor(source: string, target: string, type: string) {
    this.source = source
    this.target = target
    this.type = type
  }

  public toString(): string {
    return `${this.source},${this.target},${this.type}`
  }
}

export function DirectedGraph(
  props: {
    nodes: Map<number, GraphData>,
    edges: Map<String, GraphLink>,
    categories: Map<String, Category>,
    onChartClick: (id: number) => Promise<[Map<String, Category>, Map<number, GraphData>, Map<String, GraphLink>]>
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

          if (category) {
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
        let key = edge.toString()
        if (!props.edges.get(key)) {
          props.edges.set(key, edge)
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

  function handleZoomClick(factor: number) {
    let chart = echartRef.current
    if (chart) {
      let option = chart.getOption()
      let zoom = factor * option.series[0].zoom
      chart.setOption({
        series: [
          {
            zoom,
          }
        ]
      })
    }
  }

  // Define the options for the echarts component
  /**
   * Generates the configuration options for the echarts component.
   * @param {GraphData[]} nodes - An array of graph nodes.
   * @param {GraphLink[]} edges - An array of graph links.
   * @param {Category[]} categories - An array of categories for nodes.
   * @return {object} The echarts configuration object.
   */
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
          myZoomIn: {
            show: true,
            title: 'Zoom In',
            icon: 'path://M19 11 C19 15.41 15.41 19 11 19 6.58 19 3 15.41 3 11 3 6.58 6.58 3 11 3 15.41 3 19 6.58 19 11 zM21 21 C19.55 19.55 18.09 18.09 16.64 16.64 M11 8 C11 10 11 12 11 14 M8 11 C10 11 12 11 14 11',
            onclick: function () {
              handleZoomClick(1.1)
            }
          },
          myZoomOut: {
            show: true,
            title: 'Zoom Out',
            icon: 'path://M19 11 C19 15.41 15.41 19 11 19 6.58 19 3 15.41 3 11 3 6.58 6.58 3 11 3 15.41 3 19 6.58 19 11 zM21 21 C19.55 19.55 18.09 18.09 16.64 16.64 M8 11 C10 11 12 11 14 11',
            onclick: function () {
              handleZoomClick(0.9)
            }
          },
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
          edgeSymbol: ['none', 'arrow'],
          edgeLabel: {
            show: true,
            fontSize: 8,
            formatter: function (params: any) {
                return params.data.type;
            }
          },
          label: {
            position: 'center',
            show: true,
            formatter: '{b}',
          },
          roam: true,
          autoCurveness: true,
          lineStyle: {
            width: 2.0,
            opacity: 0.7
          },
          symbolSize: 20,
        },
      ],
    };
  };

  return (
    <div>
      <ReactEcharts
        style={{ height: "50vh" }}
        className="border"
        option={options}
        onEvents={onEvents}
        onChartReady={(e) => { echartRef.current = e }}
      />
    </div >
  )
}
