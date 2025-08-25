"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchGeolocation, fetchPincode } from "@/helpers/geolocation"
import type { FormConfig, Language, GeolocationStatus } from "@/types/form-types" // We will create this types file next
import { useRouter } from "next/navigation"

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
    fetch("form-config.json") 
      .then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json()
      })
      .then((data: FormConfig) => setConfig(data))
      .catch((error) => {
        console.error("Failed to load form config:", error)
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
export function useGeolocation({ enabled }: { enabled: boolean }) {
  const [status, setStatus] = useState<GeolocationStatus>("pending")
  const [locationData, setLocationData] = useState<{ latitude?: string; longitude?: string; pincode?: string }>({})

  useEffect(() => {
    // If the hook is not enabled, do nothing.
    if (!enabled) {
      return
    }

    const getGeolocationData = async () => {
      try {
        // We are now actively fetching, so update the status for the UI
        setStatus("pending");
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
    // This effect now depends on the `enabled` flag.
    // It will re-run when `enabled` changes from false to true.
  }, [enabled])

  return { geolocationStatus: status, locationData }
}