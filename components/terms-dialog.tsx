"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Loader } from "@/components/ui/loader"

interface TermsDialogProps {
  onAccept: () => void
}

export function TermsDialog({ onAccept }: TermsDialogProps) {
  const [isChecked, setIsChecked] = useState(false)
  const [markdown, setMarkdown] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Fetch the markdown content when the component mounts
  useEffect(() => {
    fetch('terms.md')
      .then(response => response.text())
      .then(text => {
        setMarkdown(text)
        setIsLoading(false)
      })
      .catch(error => {
        console.error("Failed to load terms and conditions:", error)
        setMarkdown("Failed to load content. Please try again later.")
        setIsLoading(false)
      })
  }, [])

  const handleAccept = () => {
    localStorage.setItem("termsAccepted", "true")
    onAccept()
  }

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Terms and Conditions</DialogTitle>
        </DialogHeader>
        
        {/* Scrollable, beautifully styled markdown content area */}
        <div className="flex-grow overflow-y-auto border rounded-md p-6 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader text="Loading Terms..." />
            </div>
          ) : (
            <article className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {markdown}
              </ReactMarkdown>
            </article>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col sm:space-x-0 items-start gap-4 pt-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" checked={isChecked} onCheckedChange={(checked) => setIsChecked(checked as boolean)} />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read and accept the terms and conditions.
            </label>
          </div>
          <Button
            type="button"
            className="w-full bg-[#41B47D] hover:bg-[#41B47D]/90"
            disabled={!isChecked || isLoading}
            onClick={handleAccept}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}