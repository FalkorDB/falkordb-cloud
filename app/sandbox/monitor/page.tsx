'use client'

import ReactEcharts, { EChartsOption } from "echarts-for-react";
import useSWR from "swr";
import Spinning from "@/app/components/spinning";
import { Monitor } from "@/app/api/db/monitor/monitor";


function getOptions(monitor: Monitor) {
    const options: EChartsOption = {
        title: {
            text: monitor.name,
            // subtext: 'cpu usage by minute',
        },
        grid: {
            top: 100,
            bottom: 50
        },
        tooltip: {
            trigger: 'axis'
        },
        toolbox: {
            show: true,
            feature: {
                //   dataZoom: {
                //     // yAxisIndex: 'none'
                //   },
                dataView: { readOnly: false },
                magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            data: monitor.xAxis
        },
        yAxis: {
            type: 'value'
        },
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: 0,
                minSpan: 5
            },
            {
                type: 'slider',
                xAxisIndex: 0,
                minSpan: 5,
                bottom: 50
            }
        ],
        series: [
            {
                data: monitor.data,
                type: 'line'
            }
        ],
        visualMap: {
            top: 50,
            right: 10,
            pieces: [
                {
                    gt: 0,
                    lte: 40,
                    color: '#93CE07'
                },
                {
                    gt: 40,
                    lte: 80,
                    color: '#FBDB0F'
                },
                {
                    gt: 80,
                    color: '#FD0100'
                }
            ],
            outOfRange: {
                color: '#999'
            }
        }
    }

    return options
}

async function getMonitorData(): Promise<Monitor[]> {

    let response = await fetch('/api/db/monitor', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (response.ok) {   
        return response.json()
    } else {
        return Promise.reject(response.text)
    }
}

export default function Page() {

    // Fetch data from server on users
    const { data, error, isLoading } = useSWR({}, getMonitorData)

    if(error) return <div>{error}</div>
    if (isLoading || !data) return <Spinning text="Loading monitor data..." />

    return (
        <main className="flex flex-col items-center justify-center text-center p-10">
            <div className="flex flex-col lg:flex-row space-x-3">
                {
                    data.map((monitor, index) => {
                        return (
                            <div key={index} className="w-80 border shadow-lg rounded-lg">
                                <ReactEcharts option={getOptions(monitor)} />
                            </div>
                        )
                    })   
                }
            </div>
        </main>
    )
}