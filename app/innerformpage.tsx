"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useFormConfig, useGeolocation, useTerms } from "@/hooks/use-form-init"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import Image from "next/image"
import { Loader } from "@/components/ui/loader"
import type { Language } from "@/types/form-types"
import { useSearchParams } from "next/navigation"
import { TermsDialog } from "@/components/terms-dialog"

export default function InnerFormPage() {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [language, setLanguage] = useState<Language>("hi")
  const searchParams = useSearchParams()
  const roomName = searchParams.get("id") || ""
  const { toast } = useToast()

  // Custom hooks manage all complex side-effect logic
  const { showTerms, acceptTerms } = useTerms()
  const { config, textContent, isLoadingConfig } = useFormConfig(language)
  const { geolocationStatus, locationData } = useGeolocation({enabled: !showTerms })

  // Effect to set initial language from browser settings
  useEffect(() => {
    const userLang = navigator.language.split("-")[0]
    if (userLang === "hi") setLanguage("hi")
  }, [])

  // Effect to populate form data from cache and new location data
  useEffect(() => {
    const cachedData = localStorage.getItem("formData")
    let initialData: Record<string, string> = {}
    if (cachedData) {
      try {
        initialData = JSON.parse(cachedData)
      } catch (e) { console.error("Failed to parse cached form data") }
    }
    // Combine cached data with newly fetched location data
    setFormData(prev => ({ ...initialData, ...prev, ...locationData }))
  }, [locationData])

  const validateField = (fieldId: string, value: string) => {
    if (!config) return false;

    const fieldConfig = config.fields.find(f => f.id === fieldId);
    if (!fieldConfig) return true;

    if (fieldConfig.required && !value) {
      toast({
        title: "Validation Error",
        description: `${fieldConfig.id} is required.`,
        variant: "destructive",
      });
      return false;
    }

    switch (fieldId) {
      case "name":
        if (!/^[\p{L}\p{M}\s]+$/u.test(value)) {
          toast({
            title: "Invalid Input",
            description: "Name should only contain alphabets.",
          });
          return false;
        }
        break;

      case "bank_acccount_number":
        if (!/^\d+$/.test(value)) {
          toast({
            title: "Invalid Input",
            description: "Account number should only contain numbers.",
          });
          return false;
        }
        break;

      case "phone":
        if (value.length !== 10 || !/^\d+$/.test(value)) {
          toast({
            title: "Invalid input",
            description: "Phone number should be a 10 digit number",
          })
          return false;
        }
    }
    return true;
  };

  const handleInputChange = (fieldId: string, value: string) => {
    const newFormData = { ...formData, [fieldId]: value };
    setFormData(newFormData);
    localStorage.setItem("formData", JSON.stringify(newFormData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config || geolocationStatus !== "success") return

    for (const field of config.fields) {
      if (field.showWhen) {
        const controllingFieldValue = formData[field.showWhen.fieldId];
        if (controllingFieldValue !== field.showWhen.hasValue) {
          continue;
        }
      }

      const value = formData[field.id] || "";
      if (!validateField(field.id, value)) {
        return;
      }
    }
    
    setIsSubmitting(true)
    try {
      formData['room_name'] = roomName;
      const submitResponse = await fetch(process.env.NEXT_PUBLIC_BACKEND_API || config.submitEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) })
      if (!submitResponse.ok) throw new Error("Failed to submit form")
      toast({ title: "Success!", description: "Form submitted successfully" })

      const json = await submitResponse.json();

      if (submitResponse.ok) {
        window.location.href = json.url || config.redirectUrl
      } else { window.location.href = config.redirectUrl }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({ title: "Error", description: "Failed to submit form. Please try again.", variant: "destructive" })
    } finally { setIsSubmitting(false) }
  }

  const isFormDisabled = isLoadingConfig || geolocationStatus !== "success"
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  useEffect(() => {
    setIsInitialLoad(false);
  }, []);

  if (isInitialLoad) {
      return <Loader />;
  }
  if (showTerms) {
    return <TermsDialog lang={language} onAccept={acceptTerms} setLanguage={setLanguage} textContent={textContent} />
  }

  if (isLoadingConfig || !config || !textContent) {
    return <Loader text={textContent?.loadingText} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C8E56E]/20 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto mb-4 flex justify-end">
          <Select
            value={language}
            onValueChange={(value: Language) => setLanguage(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-center mb-8">
          <Image
            src="karya_web.svg"
            alt="Karya Web Logo"
            width={120}
            height={60}
            className="h-16 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-[#41B47D] mb-2">
            {textContent.pageTitle}
          </h1>
          <p className="text-gray-600">{textContent.pageSubtitle}</p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="border-2 border-[#41B47D]/20 shadow-lg py-0">
            <CardHeader className="bg-[#41B47D] text-white py-3 px-4">
              <h3 className="text-lg font-semibold">{textContent.cardTitle}</h3>
            </CardHeader>
            <CardContent className="p-6 bg-[#C8E56E]/10">
              {!isFormDisabled && geolocationStatus !== "success" && (
                <div className="text-center p-2 mb-4 text-gray-700">
                  {geolocationStatus === "pending" && (
                    <p>Requesting location...</p>
                  )}
                  {geolocationStatus === "fetching_pincode" && (
                    <p>Fetching pincode...</p>
                  )}
                  {geolocationStatus === "denied" && (
                    <p className="text-red-600">Location access is required.</p>
                  )}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <fieldset disabled={isFormDisabled} className="space-y-6">
                  {config.fields.map((field) => {
                    // --- CONDITIONAL RENDERING LOGIC ---
                    if (field.showWhen) {
                      const controllingFieldValue =
                        formData[field.showWhen.fieldId];
                      if (controllingFieldValue !== field.showWhen.hasValue) {
                        return null; // Don't render this field
                      }
                    }
                    // --- END OF LOGIC ---

                    const fieldText = textContent.fields[field.id];
                    if (!fieldText) return null;

                    return (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id}>
                          {fieldText.label}
                          {field.required && (
                            <span className="text-[#41B47D] ml-1">*</span>
                          )}
                        </Label>
                        {field.type === "select" ? (
                          <Select
                            value={formData[field.id] || ""}
                            onValueChange={(value) =>
                              handleInputChange(field.id, value)
                            }
                            required={field.required}
                          >
                            <SelectTrigger disabled={isFormDisabled}>
                              <SelectValue
                                placeholder={fieldText.placeholder}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldText.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={field.id}
                            type={field.type}
                            placeholder={fieldText.placeholder}
                            value={formData[field.id] || ""}
                            onChange={(e) =>
                              handleInputChange(field.id, e.target.value)
                            }
                            required={field.required}
                            min={field.min}
                            max={field.max}
                            disabled={isFormDisabled}
                          />
                        )}
                      </div>
                    );
                  })}
                </fieldset>
                <Button
                  type="submit"
                  disabled={isSubmitting || isFormDisabled}
                  className="w-full bg-[#41B47D] hover:bg-[#41B47D]/90"
                >
                  {isSubmitting ? (
                    <>{textContent.submittingButtonText}</>
                  ) : (
                    textContent.submitButtonText
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          {textContent.links.length > 0 && (
            <div className="mt-8 text-center flex flex-wrap justify-center gap-4">
              {textContent.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#41B47D] hover:text-[#41B47D]/80 text-sm underline"
                >
                  {link.text}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
