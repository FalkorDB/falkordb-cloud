import { NextResponse } from "next/server";
import { Monitor } from "./monitor";
import { DescribeTasksCommand, ListTasksCommand, waitUntilServicesStable } from '@aws-sdk/client-ecs';
import { CloudWatchClient, GetMetricStatisticsCommand, Statistic } from '@aws-sdk/client-cloudwatch';
import { getUser } from "../../auth/user";
import { REGIONS, Region } from "../regions";
import { UserEntity } from "../../models/entities";

// // Define the parameters for the ECS task
// const region = 'us-east-1'; // Change this to your region
// const cluster = 'my-cluster'; // Change this to your cluster name
// const task = 'my-task'; // Change this to your task ID

// // Create the ECS client and the CloudWatch client
// const ecsClient = new ECSClient({ region });
// const cwClient = new CloudWatchClient({ region });

// Define a helper function to get the metric statistics from CloudWatch
async function getMetricStatistics(cwClient: CloudWatchClient, namespace: string, metricName: string, dimensions: any[], startTime: Date, endTime: Date, period: number, statistics: Statistic[]) {
  const params = {
    Namespace: namespace,
    MetricName: metricName,
    Dimensions: dimensions,
    StartTime: startTime,
    EndTime: endTime,
    Period: period,
    Statistics: statistics
  };
  const command = new GetMetricStatisticsCommand(params);
  const response = await cwClient.send(command);
  return response;
};

// Define a helper function to format and display the metric data
const displayMetricData = (metricName: string, dataPoints: any[]) => {
  console.log(`\n${metricName}:`);
  for (const dataPoint of dataPoints) {
    console.log(`${dataPoint.Timestamp.toISOString()} - ${dataPoint.Average}`);
  }
};

// Define the main function to monitor the ECS task
async function monitorECSTask(region: Region, user: UserEntity, serviceArn: string) {
  try {

    // Define the time range and the period for the metrics
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 3600 * 1000); // One hour ago
    const period = 60; // One minute

    // Get the CPU utilization metric for the container instance
    const cpuUtilizationData = await getMetricStatistics(region.cwClient,
      'AWS/ECS',
      'CPUUtilization',
      [{ Name: 'ClusterName', Value: 'falkordb' }, { Name: 'ServiceName', Value: `falkordb-${user.id}` }],
      startTime,
      endTime,
      period,
      ['Average']
    );

    // Get the memory utilization metric for the container instance
    const memoryUtilizationData = await getMetricStatistics(region.cwClient,
      'AWS/ECS',
      'MemoryUtilization',
      [{ Name: 'ClusterName', Value: 'falkordb' }, { Name: 'ServiceName', Value: `falkordb-${user.id}` }],
      startTime,
      endTime,
      period,
      ['Average']
    );

    // Get the network in metric for the container
    // const networkInData = await getMetricStatistics(region.cwClient,
    //   'AWS/ECS',
    //   'NetworkRxBytes',
    //   [{ Name: 'ClusterName', Value: 'falkordb' }, { Name: 'TaskId', Value: tasks.taskArns }, { Name: 'ContainerName', Value: container }],
    //   startTime,
    //   endTime,
    //   period,
    //   ['Average']
    // );

    // Get the network out metric for the container
    // const networkOutData = await getMetricStatistics(region.cwClient,
    //   'AWS/ECS',
    //   'NetworkTxBytes',
    //   [{ Name: 'ClusterName', Value: 'falkordb' }, { Name: 'TaskId', Value: tasks.taskArns }, { Name: 'ContainerName', Value: container }],
    //   startTime,
    //   endTime,
    //   period,
    //   ['Average']
    // );

    // Display the metric data in the console
    displayMetricData('CPU Utilization (%)', cpuUtilizationData.Datapoints ?? []);
    displayMetricData('Memory Utilization (%)', memoryUtilizationData.Datapoints ?? []);
    // displayMetricData('Network In (Bytes)', networkInData.Datapoints ?? []);
    // displayMetricData('Network Out (Bytes)', networkOutData.Datapoints ?? []);
    return { cpuUtilizationData, memoryUtilizationData };
  } catch (error) {
    console.error(error);
  }
};

export async function GET() {

  let user = await getUser()
  if (user instanceof NextResponse) {
    return user
  }

  if (!user.task_arn) {
    return NextResponse.json({ message: "Sandbox not found" }, { status: 404 })
  }

  const regionName = user.task_arn.split(":")[3]
  const region = REGIONS.get(regionName)
  if (!region) {
    return NextResponse.json({ message: `Task Get failed, can't find region: ${regionName}` }, { status: 500 })
  }

  monitorECSTask(region, user, user.task_arn)



  const monitors: Monitor[] = [
    {
      name: "CPU",
      xAxis: xindex,
      data: data
    },
    {
      name: "Memory",
      xAxis: xindex,
      data: data
    },
    {
      name: "Network",
      xAxis: xindex,
      data: data
    }
  ]

  return NextResponse.json(monitors, { status: 200 })
}