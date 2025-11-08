import { UserInfoData } from "@/app/types/UserData"
import React, { createContext, useContext, useState } from "react"

interface MultiStepContextProps {
  step: number
  setStep: (step: number) => void
  userInfo: UserInfoData
  setUserInfo: (data: UserInfoData) => void
  reset: () => void
}

const defaultUserInfo: UserInfoData = {
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
  const [userInfo, setUserInfo] = useState<UserInfoData>(defaultUserInfo)

  function reset() {
    setStep(0)
    setUserInfo(defaultUserInfo)
  }

  return (
    <MultiStepContext.Provider
      value={{
        step,
        setStep,
        userInfo,
        setUserInfo,
        reset,
      }}
    >
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
