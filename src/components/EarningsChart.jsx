import { useLanguage } from '../context/LanguageContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

function EarningsChart({ data, translations }) {
  const { language } = useLanguage()

  const getIncrease = () => {
    const increase = ((data.current - data.previous) / data.previous) * 100
    return increase.toFixed(1)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {translations[language]?.earningUpdate}
      </h3>

      {/* Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">{translations[language]?.previous}</div>
          <div className="text-2xl font-bold text-gray-700">
            ৳ {data.previous.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg p-4 border-2 border-green-300">
          <div className="text-sm text-gray-600 mb-1">{translations[language]?.current}</div>
          <div className="text-2xl font-bold text-green-600">
            ৳ {data.current.toLocaleString()}
          </div>
          <div className="text-sm text-green-600 font-semibold mt-1">
            +{getIncrease()}%
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600 mb-2">{translations[language]?.overTime}</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data.trend}>
            <defs>
              <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `৳${value/1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value) => `৳${value.toLocaleString()}`}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fill="url(#colorEarnings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default EarningsChart

