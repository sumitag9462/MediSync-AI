import React from 'react';

// 3-step register stepper
export default function StepIndicator({ currentStep = 1, steps = ['Personal Info', 'Verify Email', 'Complete'] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 28, gap: 0 }}>
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isComplete = stepNum < currentStep;
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: isComplete || isActive ? 'var(--btn-gradient)' : '#E5E7EB',
                color: isComplete || isActive ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.875rem',
                boxShadow: isActive ? 'var(--shadow-btn)' : 'none',
                transition: 'all 0.25s ease'
              }}>
                {isComplete ? '✓' : stepNum}
              </div>
              <span style={{ fontSize: '0.6875rem', color: isActive ? 'var(--accent-purple)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap' }}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div style={{ width: 48, height: 2, margin: '0 8px', marginBottom: 20,
                background: stepNum < currentStep ? 'var(--accent-purple)' : '#E5E7EB',
                transition: 'background 0.25s ease' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
