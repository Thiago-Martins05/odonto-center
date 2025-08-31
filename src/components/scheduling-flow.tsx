"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, User, Calendar } from "lucide-react";
import { ServiceSelection } from "./service-selection";
import { TimeSelection } from "./time-selection";
import { PatientForm } from "./patient-form";
import { SuccessScreen } from "./success-screen";

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number;
}

export interface AppointmentData {
  service: Service;
  selectedSlot: string;
  patientName: string;
  patientEmail: string;
  patientPhone?: string;
  observations?: string;
}

export function SchedulingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [appointmentData, setAppointmentData] = useState<Partial<AppointmentData>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const steps = [
    {
      id: 1,
      title: "Serviço",
      description: "Escolha o serviço desejado",
      icon: Calendar,
    },
    {
      id: 2,
      title: "Horário",
      description: "Selecione data e horário",
      icon: Clock,
    },
    {
      id: 3,
      title: "Seus dados",
      description: "Preencha suas informações",
      icon: User,
    },
  ];

  const handleServiceSelect = (service: Service) => {
    setAppointmentData(prev => ({ ...prev, service }));
    setCurrentStep(2);
  };

  const handleTimeSelect = (selectedSlot: string) => {
    setAppointmentData(prev => ({ ...prev, selectedSlot }));
    setCurrentStep(3);
  };

  const handleFormSubmit = async (formData: {
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    observations?: string;
  }) => {
    const completeData = {
      ...appointmentData,
      ...formData,
    } as AppointmentData;

    try {
      // TODO: Call server action to create appointment
      console.log("Creating appointment:", completeData);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error creating appointment:", error);
    }
  };

  const handleBackToStart = () => {
    setCurrentStep(1);
    setAppointmentData({});
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <SuccessScreen
        appointmentData={appointmentData as AppointmentData}
        onBackToStart={handleBackToStart}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    currentStep >= step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                    currentStep > step.id ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="rounded-2xl border-0 shadow-lg">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <ServiceSelection onServiceSelect={handleServiceSelect} />
          )}
          {currentStep === 2 && (
            <TimeSelection
              service={appointmentData.service!}
              onTimeSelect={handleTimeSelect}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <PatientForm
              service={appointmentData.service!}
              selectedSlot={appointmentData.selectedSlot!}
              onSubmit={handleFormSubmit}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
