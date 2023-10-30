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

    let waitECSTask = await waitUntilServicesStable(
      { client: region.ecsClient, maxWaitTime: 5, minDelay: 1 },
      { cluster: "falkordb", services: [serviceArn] }
    )

    // Task is not ready yet
    if (waitECSTask.state != 'SUCCESS') {
      return;
    }

    const tasks = await region.ecsClient.send(new ListTasksCommand({
      cluster: "falkordb",
      serviceName: `falkordb-${user.id}`,
    }))

    // Get the task details from ECS
    const command = new DescribeTasksCommand({ cluster: region.clusterARN, tasks: tasks.taskArns });
    const response = await region.ecsClient.send(command);
    const taskDetails = response.tasks?.[0];
    if (!taskDetails) {
      throw new Error('Task not found');
    }

    // Get the container instance ID and the container ID from the task details
    const containerInstance = taskDetails.containerInstanceArn;
    const container = taskDetails.containers?.[0].containerArn;
    if (!containerInstance || !container) {
      throw new Error('Container instance or container not found');
    }

    // Define the time range and the period for the metrics
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 3600 * 1000); // One hour ago
    const period = 60; // One minute

    // Get the CPU utilization metric for the container instance
    const cpuUtilizationData = await getMetricStatistics(region.cwClient,
      'AWS/ECS',
      'CPUUtilization',
      [{ Name: 'ClusterName', Value: 'falkordb' }, { Name: 'ContainerInstance', Value: containerInstance }],
      startTime,
      endTime,
      period,
      ['Average']
    );

    // Get the memory utilization metric for the container instance
    const memoryUtilizationData = await getMetricStatistics(region.cwClient,
      'AWS/ECS',
      'MemoryUtilization',
      [{ Name: 'ClusterName', Value: 'falkordb' }, { Name: 'ContainerInstance', Value: containerInstance }],
      startTime,
      endTime,
      period,
      ['Average']
    );

    // Get the network in metric for the container
    const networkInData = await getMetricStatistics(region.cwClient,
      'AWS/ECS',
      'NetworkRxBytes',
      [{ Name: 'ClusterName', Value: 'falkordb' }, { Name: 'TaskId', Value: tasks.taskArns }, { Name: 'ContainerName', Value: container }],
      startTime,
      endTime,
      period,
      ['Average']
    );

    // Get the network out metric for the container
    const networkOutData = await getMetricStatistics(region.cwClient,
      'AWS/ECS',
      'NetworkTxBytes',
      [{ Name: 'ClusterName', Value: 'falkordb' }, { Name: 'TaskId', Value: tasks.taskArns }, { Name: 'ContainerName', Value: container }],
      startTime,
      endTime,
      period,
      ['Average']
    );

    // Display the metric data in the console
    displayMetricData('CPU Utilization (%)', cpuUtilizationData.Datapoints ?? []);
    displayMetricData('Memory Utilization (%)', memoryUtilizationData.Datapoints ?? []);
    displayMetricData('Network In (Bytes)', networkInData.Datapoints ?? []);
    displayMetricData('Network Out (Bytes)', networkOutData.Datapoints ?? []);
  } catch (error) {
    console.error(error);
  }
};


const data = [34, 30, 24, 92, 35, 47, 60]
const xindex = [10, 20, 30, 40, 50, 60, 70]

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

  // monitorECSTask(region, user, user.task_arn)



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