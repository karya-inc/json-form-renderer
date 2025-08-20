"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"

interface FormField {
  id: string
  type: string
  label: string
  placeholder?: string
  required: boolean
  min?: number
  max?: number
  options?: { value: string; label: string }[]
}

interface FormConfig {
  formTitle: string
  submitEndpoint: string
  redirectEndpoint: string
  redirectUrl: string
  fields: FormField[]
  links: { text: string; url: string }[]
}

export default function FormPage() {
  const [config, setConfig] = useState<FormConfig | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const cachedData = localStorage.getItem("formData")

    // Load form configuration from JSON
    fetch("/form-config.json")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data)
        // Initialize form data with cached values or empty values
        const initialData: Record<string, string> = {}
        data.fields.forEach((field: FormField) => {
          initialData[field.id] = ""
        })

        if (cachedData) {
          try {
            const parsed = JSON.parse(cachedData)
            Object.keys(parsed).forEach((key) => {
              if (initialData.hasOwnProperty(key)) {
                initialData[key] = parsed[key]
              }
            })
          } catch (error) {
            console.error("Failed to parse cached data:", error)
          }
        }

        setFormData(initialData)
      })
      .catch((err) => {
        console.error("Failed to load form config:", err)
        toast({
          title: "Error",
          description: "Failed to load form configuration",
          variant: "destructive",
        })
      })
  }, [toast])

  const handleInputChange = (fieldId: string, value: string) => {
    const newFormData = {
      ...formData,
      [fieldId]: value,
    }
    setFormData(newFormData)

    localStorage.setItem("formData", JSON.stringify(newFormData))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config) return

    setIsSubmitting(true)

    try {
      // First endpoint: Submit form data
      const submitResponse = await fetch(config.submitEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!submitResponse.ok) {
        throw new Error("Failed to submit form")
      }

      toast({
        title: "Success!",
        description: "Form submitted successfully",
      })

      // Don't clear localStorage to maintain form data for future use

      // Second endpoint: Get redirect URL and redirect
      const redirectResponse = await fetch(config.redirectEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formData, defaultRedirect: config.redirectUrl }),
      })

      if (redirectResponse.ok) {
        const redirectData = await redirectResponse.json()
        window.location.href = redirectData.redirectUrl || config.redirectUrl
      } else {
        // Fallback to default redirect
        window.location.href = config.redirectUrl
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#41B47D] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C8E56E]/20 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image src="/karya_web.svg" alt="Karya Web Logo" width={120} height={60} className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-[#41B47D] mb-2">Registration Form for Conference</h1>
          <p className="text-gray-600">Please fill out the form below to continue</p>
        </div>

        {/* Form Card */}
        <div className="max-w-md mx-auto">
          <Card className="border-2 border-[#41B47D]/20 shadow-lg overflow-hidden rounded-lg py-0">
            <CardHeader className="bg-[#41B47D] text-white py-3 px-4 rounded-t-lg">
            <h3 className="text-lg font-semibold">Registration Details</h3>
            </CardHeader>
            <CardContent className="p-6 bg-[#C8E56E]/10">
              <form onSubmit={handleSubmit} className="space-y-6">
                {config.fields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-gray-700 font-medium">
                      {field.label}
                      {field.required && <span className="text-[#41B47D] ml-1">*</span>}
                    </Label>

                    {field.type === "select" ? (
                      <Select
                        value={formData[field.id] || undefined}
                        onValueChange={(value) => handleInputChange(field.id, value)}
                        required={field.required}
                      >
                        <SelectTrigger className="border-[#41B47D]/30 focus:border-[#41B47D] focus:ring-[#41B47D]/20">
                          <SelectValue placeholder={field.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.id]}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        min={field.min}
                        max={field.max}
                        className="border-[#41B47D]/30 focus:border-[#41B47D] focus:ring-[#41B47D]/20"
                      />
                    )}
                  </div>
                ))}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#41B47D] hover:bg-[#41B47D]/90 text-white font-semibold py-3 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Form"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Links Section */}
          {config.links && config.links.length > 0 && (
            <div className="mt-8 text-center">
              <div className="flex flex-wrap justify-center gap-4">
                {config.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#41B47D] hover:text-[#41B47D]/80 text-sm underline transition-colors"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  )
}
