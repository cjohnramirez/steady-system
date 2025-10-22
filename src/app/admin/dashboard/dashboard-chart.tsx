import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  numberOfVisitors: {
    label: "Number Of Visitors",
    color: "var(--color-brand-normal)",
  },
} satisfies ChartConfig;

export default function dashboardChart({
  chartData,
}: {
  chartData: {
    label: string;
    value: { date: string; numberOfVisitors: number }[];
  };
}) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[400px] w-full"
    >
      <AreaChart data={chartData.value}>
        <defs>
          <linearGradient id="fillnumberOfVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-numberOfVisitors)"
              stopOpacity={0.8}
            />
            <stop offset="95%" stopColor="white" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={32}
          tickFormatter={(value) => {
            const day = new Date(value);
            return day.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="numberOfVisitors"
          type="natural"
          fill="url(#fillnumberOfVisitors)"
          stroke="var(--color-numberOfVisitors)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
