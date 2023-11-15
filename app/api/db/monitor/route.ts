import { NextRequest, NextResponse } from "next/server";
import { Monitor } from "./monitor";
import { DescribeTasksCommand, ListTasksCommand, waitUntilServicesStable } from '@aws-sdk/client-ecs';
import { CloudWatchClient, GetMetricStatisticsCommand, GetMetricStatisticsCommandOutput, Statistic } from '@aws-sdk/client-cloudwatch';
import { getUser } from "../../auth/user";
import { REGIONS, Region } from "../regions";
import { UserEntity } from "../../models/entities";
import { getEntityManager } from "@/app/api/auth/[...nextauth]/options";

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

// Define the main function to monitor the ECS task
async function monitorECSTask(region: Region, user: UserEntity, serviceArn: string) {
  try {

    // Define the time range and the period for the metrics
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - 3600 * 1000); // One hour ago
    const period = 60; // One minute

    // Get the CPU utilization
    const cpuUtilizationData : GetMetricStatisticsCommandOutput = await getMetricStatistics(region.cwClient,
      'AWS/ECS',
      'CPUUtilization',
      [{ Name: 'ClusterName', Value: 'falkordb' }, { Name: 'ServiceName', Value: `falkordb-${user.id}` }],
      startTime,
      endTime,
      period,
      ['Average']
    );

    // Get the memory utilization
    const memoryUtilizationData : GetMetricStatisticsCommandOutput = await getMetricStatistics(region.cwClient,
      'AWS/ECS',
      'MemoryUtilization',
      [{ Name: 'ClusterName', Value: 'falkordb' }, { Name: 'ServiceName', Value: `falkordb-${user.id}` }],
      startTime,
      endTime,
      period,
      ['Average']
    );

    return { cpuUtilizationData, memoryUtilizationData };
  } catch (error) {
    return Promise.reject(error);
  }
};

export async function GET(request: NextRequest) {

  let res = await getUser()
  if (res instanceof NextResponse) {
      return res
  }
  let user: UserEntity = res;

  const taskARN = request.nextUrl.searchParams.get("task_arn");

  // If the user is admin, we can monitor any sandbox
  if(taskARN && user.task_arn != taskARN && user.role === 'admin') {

      // Find the user own the sandbox by task_arn
      let entityManager = await getEntityManager()
      let ownerUser = await entityManager.findOneBy(UserEntity, {
          task_arn: taskARN
      })

      if (!ownerUser) {
          return NextResponse.json({ message: "Sandbox not found" }, { status: 404 })
      }

      user = ownerUser
  }

  // Verify the task arn is valid and owned by the user
  if(!user.task_arn || user.task_arn != taskARN) {
      return NextResponse.json({ message: "Can't monitor SandBox" }, { status: 401 })
  }

  const regionName = user.task_arn.split(":")[3]
  const region = REGIONS.get(regionName)
  if (!region) {
    return NextResponse.json({ message: `Task Get failed, can't find region: ${regionName}` }, { status: 500 })
  }

  let { cpuUtilizationData, memoryUtilizationData } = await monitorECSTask(region, user, user.task_arn)

  let cpuMonitor : Monitor = {
    name: "CPU (avg/min)",
    xAxis: [],
    data: []
  }
  cpuUtilizationData.Datapoints?.forEach((datapoint, index, array) => {
    cpuMonitor.xAxis.push(array.length - index)
    cpuMonitor.data.push(datapoint.Average?? 0)
  })


  let memoryMonitor : Monitor = {
    name: "Memory (avg/min)",
    xAxis: [],
    data: []
  }
  memoryUtilizationData.Datapoints?.forEach((datapoint, index, array) => {
    memoryMonitor.xAxis.push(array.length - index)
    memoryMonitor.data.push(datapoint.Average?? 0)
  })

  const monitors: Monitor[] = [
    cpuMonitor,
    memoryMonitor
  ]

  return NextResponse.json(monitors, { status: 200 })
}