"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface TermsDialogProps {
  onAccept: () => void
}

export function TermsDialog({ onAccept }: TermsDialogProps) {
  const [isChecked, setIsChecked] = useState(false)

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
        
        {/* --- THE ROBUST IFRAME SOLUTION --- */}
        {/* We add #toolbar=0 to the URL. This is a standard parameter that tells most */}
        {/* modern browsers to hide their default PDF viewer toolbar (print, download, etc.) */}
        <div className="flex-grow overflow-hidden border rounded-md bg-gray-100">
          <iframe
            src="/terms.pdf#toolbar=0"
            title="Terms and Conditions PDF"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
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
            disabled={!isChecked}
            onClick={handleAccept}
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}