import { Suspense } from "react"
import InnerFormPage from "./innerformpage"

export default function FormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InnerFormPage />
    </Suspense>
  );
}
