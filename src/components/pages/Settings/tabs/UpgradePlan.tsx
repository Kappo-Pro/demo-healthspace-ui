import { PlanOptionsList } from "@stores/interfaces";
import { HtmlSanitizer } from '@services/security';
import { Button, Popover, Select } from "antd";
import { useTranslation } from "react-i18next";

const { Option } = Select;

interface UpgradePlanProps {
  selectedUpgradeValue: string | undefined;
  setSelectedUpgradeValue: (value: string) => void;
  painStatus: PlanOptionsList[];
  postUpgradePlan: () => void;
  validationError: string | null;
  setValidationError: (error: string | null) => void;
}

export default function UpgradePlan(props: UpgradePlanProps) {
  const { selectedUpgradeValue, setSelectedUpgradeValue, painStatus, postUpgradePlan, validationError, setValidationError } = props;
  const { t } = useTranslation();

  const handleChange = (value: string) => {
    setSelectedUpgradeValue(value);
    setValidationError(null);
  };

  const handleOptions = (str: string) => {
    const formattedStr = str
      .replace(/<p>/g, '<li style="margin-bottom: 10px;">')
      .replace(/<\/p>/g, '</li>');

    // Sanitize HTML to prevent XSS attacks
    const sanitized = HtmlSanitizer.sanitizePlanDescription(formattedStr);

    return <ul style={{ listStyle: 'disc', listStylePosition: 'inside' }} dangerouslySetInnerHTML={{ __html: sanitized }} />;
  };

  return (
    <>
      <div className="mt-4 feature">
        <Select
          placeholder={t('Admin.data.menu.setting.selectPlan')}
          className="select-plan-input-item"
          style={{ width: '100%', height: 'var(--spacing-12)' }}
          value={selectedUpgradeValue}
          onChange={handleChange}
          dropdownClassName="feature-option-class"
          optionLabelProp="plan"
          allowClear>
          {painStatus?.map(option => {
            return (
              <Option key={option?.id} value={option?.planType} plan={option?.plan}>
                <Popover
                  content={() => {
                    return (
                      <div className="custom-popover-content">
                        {option?.description ? handleOptions(option?.description) : <p>{t('Admin.data.menu.setting.noPlanFound')}</p>}
                      </div>
                    );
                  }}
                  placement="right"
                  overlayClassName="custom-popover"
                  mouseEnterDelay={0.2}>
                  <div>
                    <strong>{option?.plan}</strong> - {option?.title}
                  </div>
                </Popover>
              </Option>
            )
          })}
        </Select>
      </div>
      {validationError && <p style={{ color: 'var(--error-500)' }}>{validationError}</p>}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          style={{
            marginTop: 'var(--spacing-5)',
            backgroundColor: 'var(--settings-button-bg-color)',
            color: 'var(--settings-button-text-color)',
            border: 'none',
          }}
          onClick={postUpgradePlan}>
          {t('Admin.data.menu.setting.update')}
        </Button>
      </div>
    </>
  )
}
