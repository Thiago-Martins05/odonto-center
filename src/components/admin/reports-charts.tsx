"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react";

interface ChartData {
  labels: string[];
  data: number[];
  colors?: string[];
}

interface ReportsChartsProps {
  appointmentsByService: Array<{
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  appointmentsByMonth: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  availabilityByWeekday: Array<{
    weekday: string;
    slots: number;
    utilization: number;
  }>;
  financialSummary: {
    totalRevenue: number;
    monthlyRevenue: number;
    averageTicket: number;
  };
}

export function ReportsCharts({
  appointmentsByService,
  appointmentsByMonth,
  availabilityByWeekday,
  financialSummary,
}: ReportsChartsProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const getMaxValue = (data: number[]) => {
    return Math.max(...data, 1);
  };

  const getBarHeight = (value: number, maxValue: number) => {
    return Math.max((value / maxValue) * 100, 5);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Agendamentos por Serviço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Agendamentos por Serviço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointmentsByService.map((service, index) => {
              const maxCount = getMaxValue(appointmentsByService.map(s => s.count));
              const height = getBarHeight(service.count, maxCount);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate">
                      {service.serviceName}
                    </span>
                    <span className="text-sm text-gray-600">
                      {service.count} agendamentos
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${height}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Receita: {formatCurrency(service.revenue)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Receita por Mês */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Receita por Mês
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointmentsByMonth.map((month, index) => {
              const maxRevenue = getMaxValue(appointmentsByMonth.map(m => m.revenue));
              const height = getBarHeight(month.revenue, maxRevenue);
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {month.month}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(month.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${height}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {month.count} agendamentos
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Utilização por Dia da Semana */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Utilização por Dia da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availabilityByWeekday.map((day, index) => {
              const colors = [
                "bg-red-500",
                "bg-orange-500", 
                "bg-yellow-500",
                "bg-green-500",
                "bg-blue-500",
                "bg-indigo-500",
                "bg-purple-500"
              ];
              const color = colors[index % colors.length];
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {day.weekday}
                    </span>
                    <span className="text-sm text-gray-600">
                      {day.utilization}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${day.utilization}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {day.slots} horários disponíveis
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(financialSummary.totalRevenue)}
              </div>
              <p className="text-sm text-gray-600">Receita Total</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(financialSummary.monthlyRevenue)}
                </div>
                <p className="text-xs text-gray-600">Este Mês</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {formatCurrency(financialSummary.averageTicket)}
                </div>
                <p className="text-xs text-gray-600">Ticket Médio</p>
              </div>
            </div>

            {/* Indicador de Performance */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Performance Mensal</span>
                <span className="font-medium">
                  {financialSummary.monthlyRevenue > 0 ? "Positiva" : "Sem dados"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    financialSummary.monthlyRevenue > 0 ? "bg-green-500" : "bg-gray-400"
                  }`}
                  style={{ 
                    width: `${Math.min((financialSummary.monthlyRevenue / 100000) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para gráfico de pizza simples
export function SimplePieChart({ data }: { data: ChartData }) {
  const total = data.data.reduce((sum, value) => sum + value, 0);
  let cumulativePercentage = 0;

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {data.data.map((value, index) => {
          const percentage = (value / total) * 100;
          const startAngle = (cumulativePercentage / 100) * 360;
          const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
          
          const x1 = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180));
          const y1 = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180));
          const x2 = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180));
          const y2 = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180));
          
          const largeArcFlag = percentage > 50 ? 1 : 0;
          
          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
          ].join(' ');

          cumulativePercentage += percentage;

          return (
            <path
              key={index}
              d={pathData}
              fill={data.colors?.[index] || `hsl(${index * 60}, 70%, 50%)`}
              stroke="white"
              strokeWidth="0.5"
            />
          );
        })}
      </svg>
      
      {/* Labels */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold">{total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
      </div>
    </div>
  );
}

// Componente para gráfico de linha simples
export function SimpleLineChart({ data }: { data: ChartData }) {
  const maxValue = Math.max(...data.data, 1);
  const points = data.data.map((value, index) => {
    const x = (index / (data.data.length - 1)) * 100;
    const y = 100 - (value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-48">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          points={points}
          className="text-blue-600"
        />
        {data.data.map((value, index) => {
          const x = (index / (data.data.length - 1)) * 100;
          const y = 100 - (value / maxValue) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="currentColor"
              className="text-blue-600"
            />
          );
        })}
      </svg>
    </div>
  );
}
