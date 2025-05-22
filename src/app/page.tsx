import WeatherDashboard from "@/components/weather-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 to-sky-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-sky-700 dark:text-sky-400">Global Weather Explorer</h1>
        <p className="text-center text-muted-foreground mb-8">Search and compare weather across cities and countries</p>
        <WeatherDashboard />
      </div>
    </main>
  )
}
