import React, { useEffect, useState } from 'react';
import { Flex } from 'antd';

type Step = {
    label: string;
    sublabel?: string;
    onClick: () => void;
};

type StepperProps = {
    steps: Step[];
    activeStep: number;
    setActiveStep: (step: number) => void;
    isStepperClickuble?: boolean
};

const Stepper: React.FC<StepperProps> = ({ steps, activeStep, setActiveStep, isStepperClickuble = false }) => {

    const [selected, setSelected] = useState<number>(0);

    useEffect(() => {
        setSelected(activeStep);
    }, [activeStep])

    const handleStepClick = (stepIndex: number) => {
        if(isStepperClickuble){
            setSelected(stepIndex);
            setActiveStep(stepIndex);
        }
    };

    return (
        <Flex align="center" className="container select-none" style={{minWidth: '680px'}}>
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    {index > 0 && (
                        <div
                            className={`flex-auto border-2 ${index <= selected ? 'border-brand-primary' : 'border-subtle'
                                }`}
                        ></div>
                    )}
                    <Flex
                        key={index}
                        align="center" justify="center"
                        className={`h-10 w-10 rounded-full cursor-pointer ${index === selected ? 'bg-brand-primary-light border-4 border-brand-primary' : 'bg-surface-secondary'
                            }`}
                        onClick={() => handleStepClick(index)}
                    >
                        {index < selected ? (
                            <span className="text-brand-primary font-bold"><img src={'/assets/tick_mark.svg'} /></span>
                        ) : (
                            <span className={`w-3 h-3 rounded-full ${index === selected ? 'bg-brand-primary' : 'bg-neutral-200'}`}></span>
                        )}
                        <Flex align="center" justify="center" className={`absolute top-14 text-base font-semibold ${index === selected ? 'text-brand-primary' : 'text-primary'}`} style={{minWidth: '180px'}}>
                            {step.label}
                        </Flex>
                        {step.sublabel && (
                            <span className={`absolute top-20  text-base font-regular ${index === selected ? 'text-brand-primary' : 'text-secondary'}`} style={{minWidth: '150px'}}>
                                {step.sublabel}
                            </span>
                        )}
                    </Flex>
                </React.Fragment>
            ))}
        </Flex>
    );
};

export default Stepper;

