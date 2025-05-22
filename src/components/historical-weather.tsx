"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface HistoricalWeatherProps {
  cityName: string
  unit: "metric" | "imperial"
  apiKey: string
}

interface HistoricalData {
  historical: {
    [date: string]: {
      date: string
      mintemp: number
      maxtemp: number
      avgtemp: number
      totalsnow: number
      sunhour: number
      uv_index: number
      humidity: number
      precip: number
      windspeed: number
      weather_descriptions: string[]
      weather_icons: string[]
    }
  }
  location: {
    name: string
    country: string
  }
  request: {
    type: string
    query: string
    language: string
    unit: string
  }
}

export default function HistoricalWeather({ cityName, unit, apiKey }: HistoricalWeatherProps) {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHistoricalData = async () => {
    if (!date) return

    setLoading(true)
    setError(null)

    try {
      // Format date as YYYY-MM-DD for WeatherStack API
      const formattedDate = format(date, "yyyy-MM-dd")

      // Determine if we should use HTTPS based on the current environment
      const apiProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "https" : "http"

      const response = await fetch(
        `${apiProtocol}://api.weatherstack.com/historical?access_key=${apiKey}&query=${cityName}&historical_date=${formattedDate}&units=${unit === "metric" ? "m" : "f"}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch historical data")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.info || "Failed to fetch historical data")
      }

      setHistoricalData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-sky-700 dark:text-sky-400">Historical Weather</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Select a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => date > new Date() || date < new Date("2008-01-01")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button onClick={fetchHistoricalData} disabled={!date || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                "Get Historical Data"
              )}
            </Button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {historicalData && (
            <div className="mt-4">
              {Object.keys(historicalData.historical).map((dateKey) => {
                const data = historicalData.historical[dateKey]
                return (
                  <Card key={dateKey} className="bg-sky-50 dark:bg-gray-700 border-0 mb-4">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{format(new Date(data.date), "PPP")}</h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Temperature</span>
                          <div className="flex items-center gap-2">
                            <img
                              src={data.weather_icons?.[0] || "/placeholder.svg"}
                              alt={data.weather_descriptions?.[0] || "Weather"}
                              className="w-10 h-10"
                            />
                            <div>
                              <p className="font-medium">
                                Avg: {Math.round(data.avgtemp)}°{unit === "metric" ? "C" : "F"}
                              </p>
                              <p className="text-sm">
                                Min: {Math.round(data.mintemp)}° / Max: {Math.round(data.maxtemp)}°
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground">Conditions</span>
                          <p className="font-medium capitalize">{data.weather_descriptions?.[0] || "N/A"}</p>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground">Precipitation</span>
                          <p className="font-medium">{data.precip} mm</p>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground">Humidity</span>
                          <p className="font-medium">{data.humidity}%</p>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground">Wind Speed</span>
                          <p className="font-medium">
                            {data.windspeed} {unit === "metric" ? "km/h" : "mph"}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm text-muted-foreground">UV Index</span>
                          <p className="font-medium">{data.uv_index}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
