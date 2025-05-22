"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Wind } from "lucide-react"

interface ForecastDisplayProps {
  forecastData: {
    forecast?: {
      [date: string]: {
        avgtemp: number
        maxtemp: number
        mintemp: number
        humidity?: number
        weather_descriptions?: string[]
        weather_icons?: string[]
        hourly: Array<{
          time: string
          temperature: number
          humidity: number
          wind_speed: number
          weather_descriptions: string[]
          weather_icons: string[]
        }>
      }
    }
    location: {
      name: string
      country: string
    }
  }
  unit: "metric" | "imperial"
}

export default function ForecastDisplay({ forecastData, unit }: ForecastDisplayProps) {
  // Check if forecast data is available
  if (!forecastData.forecast || Object.keys(forecastData.forecast).length === 0) {
    return (
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-sky-700 dark:text-sky-400">Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            Forecast data is not available for this location or with your current API plan.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Get the forecast dates
  const forecastDates = Object.keys(forecastData.forecast).slice(0, 5)

  const formatDay = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { weekday: "short" })
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-sky-700 dark:text-sky-400">Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {forecastDates.map((date) => {
            const forecast = forecastData.forecast![date]
            // Get the noon hourly forecast if available (12:00)
            const noonForecast = forecast.hourly?.find((h) => h.time === "1200") || forecast.hourly?.[0]

            return (
              <Card key={date} className="bg-sky-50 dark:bg-gray-700 border-0">
                <CardContent className="p-4 flex flex-col items-center">
                  <p className="font-medium">{formatDay(date)}</p>
                  <img
                    src={noonForecast?.weather_icons?.[0] || "/placeholder.svg"}
                    alt={noonForecast?.weather_descriptions?.[0] || "Weather"}
                    className="w-16 h-16 my-2"
                  />
                  <p className="text-xl font-bold mb-1">
                    {Math.round(forecast.avgtemp)}°{unit === "metric" ? "C" : "F"}
                  </p>
                  <p className="text-sm text-center capitalize text-muted-foreground mb-2">
                    {noonForecast?.weather_descriptions?.[0] || ""}
                  </p>
                  <div className="flex justify-between w-full text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Droplets className="h-3 w-3 mr-1" />
                      <span>{noonForecast?.humidity || forecast.humidity || "N/A"}%</span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-3 w-3 mr-1" />
                      <span>
                        {noonForecast?.wind_speed || "N/A"} {unit === "metric" ? "km/h" : "mph"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
