"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Droplets, Wind, Thermometer, Gauge } from "lucide-react"

interface WeatherDisplayProps {
  weatherData: {
    location: {
      name: string
      country: string
      localtime: string
      localtime_epoch: number
    }
    current: {
      temperature: number
      feelslike: number
      humidity: number
      pressure: number
      weather_descriptions: string[]
      weather_icons: string[]
      wind_speed: number
      wind_dir: string
      visibility: number
      cloudcover: number
      uv_index: number
      observation_time: string
    }
  }
  unit: "metric" | "imperial"
}

export default function WeatherDisplay({ weatherData, unit }: WeatherDisplayProps) {
  const { location, current } = weatherData

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Helper function to get country flag emoji
  const getCountryFlag = (countryCode: string): string => {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  // Helper function to get country name from country code
  const getCountryName = (countryCode: string): string => {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" })
    try {
      return regionNames.of(countryCode) || countryCode
    } catch (e) {
      return countryCode
    }
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-2xl text-sky-700 dark:text-sky-400">
          <span className="mr-2 text-3xl">{getCountryFlag(location.country)}</span>
          <span>
            {location.name}, {getCountryName(location.country)}
          </span>
        </CardTitle>
        <p className="text-muted-foreground">{formatDate(location.localtime)}</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col justify-between">
            <div className="flex items-center">
              <img
                src={current.weather_icons[0] || "/placeholder.svg"}
                alt={current.weather_descriptions[0]}
                className="w-24 h-24"
              />
              <div className="ml-2">
                <p className="text-5xl font-bold">
                  {Math.round(current.temperature)}°{unit === "metric" ? "C" : "F"}
                </p>
                <p className="capitalize text-lg text-muted-foreground">{current.weather_descriptions[0]}</p>
              </div>
            </div>
            <p className="text-muted-foreground mt-4">
              Feels like {Math.round(current.feelslike)}°{unit === "metric" ? "C" : "F"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-sky-500" />
              <div>
                <p className="text-sm text-muted-foreground">Temperature</p>
                <p className="font-medium">
                  {Math.round(current.temperature)}°{unit === "metric" ? "C" : "F"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-sky-500" />
              <div>
                <p className="text-sm text-muted-foreground">Humidity</p>
                <p className="font-medium">{current.humidity}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-sky-500" />
              <div>
                <p className="text-sm text-muted-foreground">Wind</p>
                <p className="font-medium">
                  {current.wind_speed} {unit === "metric" ? "km/h" : "mph"} {current.wind_dir}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-sky-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pressure</p>
                <p className="font-medium">{current.pressure} mb</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-sky-500"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
              <div>
                <p className="text-sm text-muted-foreground">UV Index</p>
                <p className="font-medium">{current.uv_index}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-sky-500"
              >
                <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0" />
                <path d="M12 2a10 10 0 0 0-6.88 17.23" />
                <path d="M12 12h.01" />
              </svg>
              <div>
                <p className="text-sm text-muted-foreground">Visibility</p>
                <p className="font-medium">
                  {current.visibility} {unit === "metric" ? "km" : "miles"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
