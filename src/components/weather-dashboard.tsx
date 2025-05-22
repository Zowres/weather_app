"use client"

import { useState } from "react"
import { Search, Loader2, Plus } from "lucide-react"
import WeatherDisplay from "./weather-display"
import ForecastDisplay from "./forecase-display"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import WeatherCard from "./weather-card"
import HistoricalWeather from "./historical-weather"

// Update the WeatherData interface to match WeatherStack's response format
interface WeatherData {
  id?: string // Add this line for our custom ID
  request: {
    type: string
    query: string
    language: string
    unit: string
  }
  location: {
    name: string
    country: string
    region: string
    lat: string
    lon: string
    timezone_id: string
    localtime: string
    localtime_epoch: number
    utc_offset: string
  }
  current: {
    observation_time: string
    temperature: number
    weather_code: number
    weather_icons: string[]
    weather_descriptions: string[]
    wind_speed: number
    wind_degree: number
    wind_dir: string
    pressure: number
    precip: number
    humidity: number
    cloudcover: number
    feelslike: number
    uv_index: number
    visibility: number
  }
  forecast?: any // For forecast data if available
  historical?: any // For historical data if available
}

// Update the ForecastData interface to match WeatherStack's forecast response
interface ForecastData {
  request: {
    type: string
    query: string
    language: string
    unit: string
  }
  location: {
    name: string
    country: string
    region: string
    lat: string
    lon: string
    timezone_id: string
    localtime: string
    localtime_epoch: number
    utc_offset: string
  }
  forecast: {
    [date: string]: {
      date: string
      date_epoch: number
      astro: {
        sunrise: string
        sunset: string
        moonrise: string
        moonset: string
        moon_phase: string
        moon_illumination: number
      }
      mintemp: number
      maxtemp: number
      avgtemp: number
      totalsnow: number
      sunhour: number
      uv_index: number
      hourly: Array<{
        time: string
        temperature: number
        wind_speed: number
        wind_degree: number
        wind_dir: string
        weather_code: number
        weather_icons: string[]
        weather_descriptions: string[]
        precip: number
        humidity: number
        visibility: number
        pressure: number
        cloudcover: number
        heatindex: number
        dewpoint: number
        windchill: number
        windgust: number
        feelslike: number
        chanceofrain: number
        chanceofremdry: number
        chanceofwindy: number
        chanceofovercast: number
        chanceofsunshine: number
        chanceoffrost: number
        chanceofhightemp: number
        chanceoffog: number
        chanceofsnow: number
        chanceofthunder: number
        uv_index: number
      }>
    }
  }
}

export default function WeatherDashboard() {
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [weatherDataList, setWeatherDataList] = useState<WeatherData[]>([])
  const [selectedWeather, setSelectedWeather] = useState<WeatherData | null>(null)
  const [forecastData, setForecastData] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(false)
  const [unit, setUnit] = useState<"metric" | "imperial">("metric")
  const { toast } = useToast()
  const [showHistorical, setShowHistorical] = useState(false)

  const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY

  // Update the fetchWeather function to use WeatherStack API
  const fetchWeather = async () => {
    if (!city.trim()) {
      toast({
        title: "Please enter a city name",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Build query with city and optional country
      const query = country.trim() ? `${city.trim()},${country.trim()}` : city.trim()

      // Determine if we should use HTTPS based on the current environment
      const apiProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "https" : "http"

      // Fetch current weather from WeatherStack
      const weatherResponse = await fetch(
        `${apiProtocol}://api.weatherstack.com/current?access_key=${API_KEY}&query=${query}&units=${unit === "metric" ? "m" : "f"}`,
      )

      if (!weatherResponse.ok) {
        throw new Error("City not found")
      }

      const weatherData = await weatherResponse.json()

      if (weatherData.error) {
        throw new Error(weatherData.error.info || "City not found")
      }

      // Generate a unique ID since WeatherStack doesn't provide one
      const cityId = `${weatherData.location.name}-${weatherData.location.country}`.toLowerCase().replace(/\s+/g, "-")
      weatherData.id = cityId

      // Check if this city is already in the list
      const exists = weatherDataList.some((item) => item.id === cityId)

      if (!exists) {
        setWeatherDataList((prev) => [...prev, weatherData])
      } else {
        toast({
          title: "City already added",
          description: `Weather for ${weatherData.location.name}, ${weatherData.location.country} is already displayed`,
        })
      }

      setSelectedWeather(weatherData)

      // Fetch forecast data if available
      try {
        const forecastResponse = await fetch(
          `${apiProtocol}://api.weatherstack.com/forecast?access_key=${API_KEY}&query=${query}&units=${unit === "metric" ? "m" : "f"}&forecast_days=5`,
        )

        if (forecastResponse.ok) {
          const forecastData = await forecastResponse.json()
          if (!forecastData.error) {
            setForecastData(forecastData)
          }
        }
      } catch (forecastError) {
        console.error("Forecast data not available:", forecastError)
        // Don't throw here, just log the error since forecast is optional
      }

      // Clear the input fields
      setCity("")
      setCountry("")
    } catch (error) {
      toast({
        title: "Error fetching weather data",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Update the selectCity function to use WeatherStack API
  const selectCity = async (cityData: WeatherData) => {
    setSelectedWeather(cityData)
    setLoading(true)

    try {
      // Fetch forecast for the selected city
      const query = cityData.location.name
      // Determine if we should use HTTPS based on the current environment
      const apiProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "https" : "http"
      const forecastResponse = await fetch(
        `${apiProtocol}://api.weatherstack.com/forecast?access_key=${API_KEY}&query=${query}&units=${unit === "metric" ? "m" : "f"}&forecast_days=5`,
      )

      if (!forecastResponse.ok) {
        throw new Error("Forecast data not available")
      }

      const forecastData = await forecastResponse.json()
      if (forecastData.error) {
        throw new Error(forecastData.error.info || "Forecast data not available")
      }

      setForecastData(forecastData)
    } catch (error) {
      console.error("Error fetching forecast:", error)
      // Don't show toast for forecast errors as it might not be available in all plans
    } finally {
      setLoading(false)
    }
  }

  const removeCity = (id?: String) => {
    setWeatherDataList((prev) => prev.filter((item) => item.id !== id))

    // If the removed city was selected, clear the selection
    if (selectedWeather && selectedWeather.id === id) {
      setSelectedWeather(null)
      setForecastData(null)
    }
  }

  // Update the toggleUnit function to use WeatherStack API
  const toggleUnit = () => {
    setUnit((prev) => (prev === "metric" ? "imperial" : "metric"))

    // Update all weather data with the new unit
    if (weatherDataList.length > 0) {
      const updatePromises = weatherDataList.map(async (cityData) => {
        const newUnit = unit === "metric" ? "f" : "m"
        // Determine if we should use HTTPS based on the current environment
        const apiProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "https" : "http"
        const response = await fetch(
          `${apiProtocol}://api.weatherstack.com/current?access_key=${API_KEY}&query=${cityData.location.name}&units=${newUnit}`,
        )
        const data = await response.json()
        data.id = cityData.id // Preserve the ID
        return data
      })

      Promise.all(updatePromises)
        .then((updatedData) => {
          setWeatherDataList(updatedData)

          // Update selected weather if any
          if (selectedWeather) {
            const updated = updatedData.find((item) => item.id === selectedWeather.id)
            if (updated) {
              setSelectedWeather(updated)

              // Update forecast data
              // Determine if we should use HTTPS based on the current environment
              const apiProtocol =
                typeof window !== "undefined" && window.location.protocol === "https:" ? "https" : "http"
              fetch(
                `${apiProtocol}://api.weatherstack.com/forecast?access_key=${API_KEY}&query=${updated.location.name}&units=${unit === "metric" ? "f" : "m"}&forecast_days=5`,
              )
                .then((res) => res.json())
                .then((data) => {
                  if (!data.error) {
                    setForecastData(data)
                  }
                })
                .catch((err) => console.error("Error updating forecast:", err))
            }
          }
        })
        .catch((err) => {
          console.error("Error updating weather data:", err)
          toast({
            title: "Error updating weather data",
            description: "Failed to update with new temperature unit",
            variant: "destructive",
          })
        })
    }
  }

  // Update the groupedCities logic to use WeatherStack data structure
  const groupedCities = weatherDataList.reduce(
    (acc, city) => {
      const country = city.location.country
      if (!acc[country]) {
        acc[country] = []
      }
      acc[country].push(city)
      return acc
    },
    {} as Record<string, WeatherData[]>,
  )

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
                className="pl-9"
              />
            </div>
            <div className="relative flex-grow">
              <Input
                placeholder="Country code (optional)..."
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchWeather()}
              />
            </div>
            <Button onClick={fetchWeather} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add City
                </>
              )}
            </Button>
            <Button variant="outline" onClick={toggleUnit} disabled={loading}>
              {unit === "metric" ? "°C" : "°F"}
            </Button>
            <Button variant="outline" onClick={() => setShowHistorical(!showHistorical)} disabled={loading}>
              {showHistorical ? "Hide Historical" : "Show Historical"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {Object.entries(groupedCities).length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedCities).map(([countryCode, cities]) => (
            <div key={countryCode} className="space-y-2">
              <h2 className="text-xl font-semibold text-sky-700 dark:text-sky-400 flex items-center">
                <span className="mr-2 text-2xl">{getCountryFlag(countryCode)}</span>
                {getCountryName(countryCode)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cities.map((cityData) => (
                  <WeatherCard
                    key={cityData.id}
                    weatherData={cityData}
                    unit={unit}
                    isSelected={selectedWeather?.id === cityData.id}
                    onSelect={() => selectCity(cityData)}
                    onRemove={() => removeCity(cityData.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedWeather && (
        <div className="space-y-6">
          <WeatherDisplay weatherData={selectedWeather} unit={unit} />
          {forecastData && <ForecastDisplay forecastData={forecastData} unit={unit} />}
          {showHistorical && selectedWeather && (
            <HistoricalWeather cityName={selectedWeather.location.name} unit={unit} apiKey={API_KEY || ""} />
          )}
        </div>
      )}
    </div>
  )
}

// Helper function to get country flag emoji
function getCountryFlag(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// Helper function to get country name from country code
function getCountryName(countryCode: string): string {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" })
  try {
    return regionNames.of(countryCode) || countryCode
  } catch (e) {
    return countryCode
  }
}
