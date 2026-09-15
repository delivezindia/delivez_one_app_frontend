import React from 'react'
import {
  Truck,
  MapPin,
  User,
  FileText,
  Package,
  ShieldCheck,
  BadgeCheck,
  Check,
  CheckCircle2,
} from 'lucide-react'
import styles from '../ConfidentialDeliveryBookingPage.module.css'

export const STEP_CONFIGS = [
  { id: 1, key: 'service', label: 'Service', icon: Truck },
  { id: 2, key: 'pickup', label: 'Pickup', icon: MapPin },
  { id: 3, key: 'delivery', label: 'Delivery', icon: User },
  { id: 4, key: 'item', label: 'Item', icon: FileText },
  { id: 5, key: 'packaging', label: 'Packaging', icon: Package },
  { id: 6, key: 'security', label: 'Security', icon: ShieldCheck },
  { id: 7, key: 'verification', label: 'Verification', icon: BadgeCheck },
  { id: 8, key: 'review', label: 'Review', icon: FileText },
  { id: 9, key: 'confirm', label: 'Conform', icon: CheckCircle2 },
]

export default function BookingStepper({ currentStep, onStepClick }) {
  return (
    <div className={styles.stepperWrapper}>
      <div className={styles.stepperContainer}>
        {STEP_CONFIGS.map((step, idx) => {
          const isCompleted = currentStep > step.id
          const isActive = currentStep === step.id
          const IconComp = step.icon

          return (
            <React.Fragment key={step.id}>
              <div
                className={`${styles.stepNode} ${isActive ? styles.stepActive : ''} ${
                  isCompleted ? styles.stepCompleted : ''
                }`}
                onClick={() => {
                  if (isCompleted && onStepClick) {
                    onStepClick(step.id)
                  }
                }}
              >
                <div
                  className={`${styles.stepCircle} ${isActive ? styles.circleActive : ''} ${
                    isCompleted ? styles.circleCompleted : ''
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} strokeWidth={2.8} className={styles.stepCheckIcon} />
                  ) : (
                    <IconComp size={16} className={isActive ? styles.iconActive : styles.iconInactive} />
                  )}
                </div>
                <span
                  className={`${styles.stepLabel} ${isActive ? styles.labelActive : ''} ${
                    isCompleted ? styles.labelCompleted : ''
                  }`}
                >
                  {step.label}
                </span>
                {isActive && <div className={styles.stepActiveUnderline} />}
              </div>

              {idx < STEP_CONFIGS.length - 1 && (
                <div
                  className={`${styles.stepConnectorLine} ${
                    currentStep > step.id ? styles.lineCompleted : ''
                  }`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
