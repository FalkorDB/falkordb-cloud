import React from 'react';
// import the core library.
import ReactEChartsCore from 'echarts-for-react/lib/core';
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
// Import charts, all with Chart suffix
import {
  // LineChart,
  BarChart,
  // PieChart,
  // ScatterChart,
  // RadarChart,
  // MapChart,
  // TreeChart,
  // TreemapChart,
  // GraphChart,
  // GaugeChart,
  // FunnelChart,
  // ParallelChart,
  // SankeyChart,
  // BoxplotChart,
  // CandlestickChart,
  // EffectScatterChart,
  // LinesChart,
  // HeatmapChart,
  // PictorialBarChart,
  // ThemeRiverChart,
  // SunburstChart,
  // CustomChart,
} from 'echarts/charts';
// import components, all suffixed with Component
import {
  // GridSimpleComponent,
  GridComponent,
  // PolarComponent,
  // RadarComponent,
  // GeoComponent,
  // SingleAxisComponent,
  // ParallelComponent,
  // CalendarComponent,
  // GraphicComponent,
  // ToolboxComponent,
  TooltipComponent,
  // AxisPointerComponent,
  // BrushComponent,
  TitleComponent,
  // TimelineComponent,
  // MarkPointComponent,
  // MarkLineComponent,
  // MarkAreaComponent,
  // LegendComponent,
  // LegendScrollComponent,
  // LegendPlainComponent,
  // DataZoomComponent,
  // DataZoomInsideComponent,
  // DataZoomSliderComponent,
  // VisualMapComponent,
  // VisualMapContinuousComponent,
  // VisualMapPiecewiseComponent,
  // AriaComponent,
  // TransformComponent,
  DatasetComponent,
} from 'echarts/components';
// Import renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
import {
  CanvasRenderer,
  // SVGRenderer,
} from 'echarts/renderers'

import ReactEcharts, { EChartsOption } from "echarts-for-react";

const options = {
  title: {
    text: 'Les Miserables',
    subtext: 'Default layout',
    top: 'bottom',
    left: 'right'
  },
  tooltip: {},
  // legend: [
  //   {
  //     // selectedMode: 'single',
  //     data: graph.categories.map(function (a: { name: string }) {
  //       return a.name;
  //     })
  //   }
  // ],
  series: [
    {
      name: 'Les Miserables',
      type: 'graph',
      layout: 'force',
      data: [{ id: 1, name: "a" }, { id: 2, name: "b" }, { id: 3, name: "c" }], //graph.nodes,
      links: [{ source: 1, target: 2 }, { source: 1, target: 3 }, { source: 2, target: 3 }], // graph.links,
      // categories: graph.categories,
      roam: true,
      label: {
        position: 'right'
      },
      force: {
        repulsion: 100
      }
    }
  ]
};

export interface GraphData {
    name:string, 
    value:number
}

export interface GraphLink {
  source:string, 
  target:string
}


export function DirectedGraph(props: {data:GraphData[], links:GraphLink[]}) {

  // // Register the required components
  // echarts.use([TitleComponent, TooltipComponent, GridComponent, BarChart, CanvasRenderer])

  // Generate some random data for the 3D scatter plot
  // const generateData = () => {
  //   const data = [];
  //   for (let i = 0; i < 100; i++) {
  //     data.push({
  //       // fixed: true,
  //       // x: Math.random() * 10,
  //       // y: Math.random() * 10,
  //       // z: Math.random() * 10,
  //       value: i,
  //       name: i.toString(),
  //   });
  //   }
  //   return data;
  // };


  // const generateLinks = () => {
  //   const data = [];
  //   for (let i = 0; i < 100; i++) {
  //     data.push({
  //       source: i.toString(),
  //       target: (i+1).toString(),
  //   });
  //   }
  //   return data;
  // };

  // Define the options for the echarts component
  function getOption() : EChartsOption {
    return {
      // title: {
      //   text: "3D Graph view",
      // },
      // tooltip: {},
      // xAxis3D: {
      //   type: "value",
      // },
      // yAxis3D: {
      //   type: "value",
      // },
      // zAxis3D: {
      //   type: "value",
      // },
      grid3D: {
        viewControl: {
          // Enable rotation
          autoRotate: true,
        },
      },
      series: [
        {
          type: "graph",
          layout: "force",
          data: props.data,
          links: props.links,
          roam: true,
          // symbolSize: 12,
          itemStyle: {
             color: "blue",
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

  return (
    <div>
      <ReactEcharts option={getOption()} />;
    </div>
  );
}