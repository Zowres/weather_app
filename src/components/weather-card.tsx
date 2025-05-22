"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeatherCardProps {
  weatherData: {
    id?: string
    location: {
      name: string
      country: string
    }
    current: {
      temperature: number
      weather_descriptions: string[]
      weather_icons: string[]
    }
  }
  unit: "metric" | "imperial"
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}

export default function WeatherCard({ weatherData, unit, isSelected, onSelect, onRemove }: WeatherCardProps) {
  const { location, current } = weatherData

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove()
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
        isSelected ? "ring-2 ring-sky-500 dark:ring-sky-400" : "",
      )}
      onClick={onSelect}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-10",
          getWeatherGradient(current.weather_descriptions[0]),
        )}
      />

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-70 hover:opacity-100 z-10"
        onClick={handleRemove}
      >
        <X className="h-4 w-4" />
      </Button>

      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{location.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">{current.weather_descriptions[0]}</p>
        </div>

        <div className="flex items-center">
          <img
            src={current.weather_icons[0] || "/placeholder.svg"}
            alt={current.weather_descriptions[0]}
            className="w-12 h-12 mr-1"
          />
          <span className="text-xl font-bold">
            {Math.round(current.temperature)}°{unit === "metric" ? "C" : "F"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get gradient based on weather description
function getWeatherGradient(description: string): string {
  const desc = description.toLowerCase()

  // Clear, sunny
  if (desc.includes("clear") || desc.includes("sunny")) {
    return "from-yellow-300 to-orange-500"
  }
  // Partly cloudy, scattered clouds
  else if (desc.includes("partly cloudy") || desc.includes("scattered clouds")) {
    return "from-blue-300 to-gray-400"
  }
  // Cloudy, overcast
  else if (desc.includes("cloudy") || desc.includes("overcast")) {
    return "from-gray-300 to-gray-500"
  }
  // Rain, drizzle, shower
  else if (desc.includes("rain") || desc.includes("drizzle") || desc.includes("shower")) {
    return "from-blue-400 to-blue-600"
  }
  // Thunderstorm
  else if (desc.includes("thunder") || desc.includes("lightning")) {
    return "from-purple-400 to-gray-700"
  }
  // Snow
  else if (desc.includes("snow") || desc.includes("sleet") || desc.includes("blizzard")) {
    return "from-blue-100 to-gray-300"
  }
  // Mist, fog
  else if (desc.includes("mist") || desc.includes("fog")) {
    return "from-gray-300 to-gray-400"
  }
  // Default
  return "from-blue-200 to-blue-400"
}
