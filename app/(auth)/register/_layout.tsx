import { Stack } from "expo-router"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"

import { MultiStepProvider } from "@/app/context/MultiStepContext"
import { RegisterFormData } from "@/app/types/UserData"

export default function RegisterLayout() {
  const methods = useForm<RegisterFormData>({
    defaultValues: {
      email: "",
      password: "",
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
      licensePlate: "",
      brand: "",
      model: "",
      year: "",
      color: "",
      vehicleType: "",
    },
  })

  return (
    <MultiStepProvider>
      <FormProvider {...methods}>
        <Stack screenOptions={{ headerShown: false }} />
      </FormProvider>
    </MultiStepProvider>
  )
}
