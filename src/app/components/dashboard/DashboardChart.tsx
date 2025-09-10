"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ChartData {
  month: string
  ventas: number
  productos: number
}

interface DashboardChartProps {
  data: ChartData[]
}

export default function DashboardChart({ data }: DashboardChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="month" 
          stroke="#666" 
          fontSize={12}
        />
        <YAxis 
          stroke="#666" 
          fontSize={12}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value: number, name: string) => [
            name === 'ventas' ? `$${value.toLocaleString()}` : value,
            name === 'ventas' ? 'Ventas' : 'Productos vendidos'
          ]}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="ventas" 
          stroke="#4f46e5" 
          strokeWidth={3}
          dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: '#3730a3' }}
          name="Ventas"
        />
        <Line 
          type="monotone" 
          dataKey="productos" 
          stroke="#10b981" 
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5, fill: '#059669' }}
          name="Productos vendidos"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}