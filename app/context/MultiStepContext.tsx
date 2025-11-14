import { RegisterFormData } from "@/app/types/UserData"
import React, { createContext, useContext, useState, useMemo, useCallback } from "react"

interface MultiStepContextProps {
  step: number
  setStep: (step: number) => void
  userInfo: RegisterFormData
  setUserInfo: (data: RegisterFormData) => void
  reset: () => void
}

const defaultUserInfo: RegisterFormData = {
  name: "",
  dob: "",
  cpf: "",
  phone: "",
  address: "",
  city: "",
  number: "",
  complement: "",
  state: "",
  zipCode: "",
  email: "",
  password: "",
}

const MultiStepContext = createContext<MultiStepContextProps | undefined>(
  undefined
)

export const MultiStepProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [step, setStep] = useState(0)
  const [userInfo, setUserInfo] = useState<RegisterFormData>(defaultUserInfo)

  const reset = useCallback(() => {
    setStep(0)
    setUserInfo(defaultUserInfo)
  }, [])

  const contextValue = useMemo(() => ({
    step,
    setStep,
    userInfo,
    setUserInfo,
    reset,
  }), [step, userInfo, reset])

  return (
    <MultiStepContext.Provider value={contextValue}>
      {children}
    </MultiStepContext.Provider>
  )
}

export function useMultiStep() {
  const ctx = useContext(MultiStepContext)
  if (!ctx)
    throw new Error("useMultiStep must be used within a MultiStepProvider")
  return ctx
}
