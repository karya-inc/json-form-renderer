"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchGeolocation, fetchPincode } from "@/helpers/geolocation"
import type { FormConfig, Language, GeolocationStatus } from "@/types/form-types" // We will create this types file next

/**
 * Hook to manage the Terms & Conditions dialog state.
 */
export function useTerms() {
  const [showTerms, setShowTerms] = useState(true) // Start with true, useEffect will correct it

  useEffect(() => {
    const termsAccepted = localStorage.getItem("termsAccepted")
    if (termsAccepted === "true") {
      setShowTerms(false)
    }
  }, [])

  const acceptTerms = () => {
    localStorage.setItem("termsAccepted", "true")
    setShowTerms(false)
  }

  return { showTerms, acceptTerms }
}

/**
 * Hook to fetch and manage the dynamic form configuration from JSON.
 */
export function useFormConfig(language: Language) {
  const [config, setConfig] = useState<FormConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/form-config.json")
      .then((res) => res.json())
      .then((data: FormConfig) => setConfig(data))
      .catch((error) => {
        console.error("Failed to load form config:", error)
        // Here you could use a toast notification
      })
      .finally(() => setIsLoading(false))
  }, [])

  const textContent = useMemo(() => {
    if (!config) return null
    return config.translations[language]
  }, [config, language])

  return { config, textContent, isLoadingConfig: isLoading }
}

/**
 * Hook to handle the entire geolocation process (coordinates and pincode).
 */
export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>("pending")
  const [locationData, setLocationData] = useState<{ latitude?: string; longitude?: string; pincode?: string }>({})

  useEffect(() => {
    const getGeolocationData = async () => {
      try {
        const { latitude, longitude } = await fetchGeolocation()
        setStatus("fetching_pincode")
        const pincode = await fetchPincode(latitude, longitude)
        
        const finalLocationData = {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          pincode: pincode || "N/A",
        }
        
        setLocationData(finalLocationData)
        setStatus("success")
      } catch (error: any) {
        console.error("Geolocation process failed:", error.message)
        setStatus("denied")
      }
    }
    getGeolocationData()
  }, [])

  return { geolocationStatus: status, locationData }
}