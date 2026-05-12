export const DEFAULT_EMAIL_TEMPLATE = `<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
  <p>Hello {{name}},</p>
  <br/><p>Welcome to our system!</p>
  <br/><p>We are excited to have you on board.</p>
  <br/><p>To access your account, please use the credentials provided below.</p>
  <br/><p>For any questions or support, feel free to contact our team.</p>
  <br/><p>Best regards,</p>
  <p>{{admin_name}}</p>
  <p>Your Virtual Assistant</p>
  </body>
</html>`;

export const DEFAULT_INVITE_TEMPLATE = `<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <p style="margin-bottom: 1.5em;">Hello {{name}},</p>
    <br/><p style="margin-bottom: 1.5em;">I'd like to invite you to join our <strong>Virtual Assistant</strong> platform, where we can work together on your recovery.</p>
    <br/><p style="margin-bottom: 1.5em;">On the platform, you will have access to your personalized treatment plan, track your progress with assessment tools, and receive guidance directly from me.</p>
    <br/><p>Click the link below to accept the invitation and start your recovery journey:</p>
    <br/><p style="margin-bottom: 1.5em;">
      <a href="{{link}}" style="color: #4A90E2; text-decoration: none;" target="_blank">Accept Invitation and Access the Platform</a>
    </p>
    <br/><p style="margin-bottom: 1.5em;">We're here to help you achieve the best results. If you need further information, feel free to contact me.</p>
    <br/><p>Best regards,</p>
    <p>{{admin_name}}</p>
    <p>Your Virtual Assistant</p>
  </body>
</html>`;

export const DEFAULT_RESULT_BY_EMAIL_TEMPLATE = `<html>
  <body style="font-family: Arial, sans-serif; color: #333;">
    <p style="margin-bottom: 1.5em;">Hello {{name}},</p>
    <br/><p style="margin-bottom: 1.5em;">I hope you're doing well!</p>
    <br/><p style="margin-bottom: 1.5em;">I'm sharing the results of your recent range of motion assessment conducted on <strong>{{assessment_date}}</strong>.</p>
    <br/><p>Please find your full assessment report attached to this email.</p>
    <br/><p style="margin-bottom: 1.5em;">Reviewing your progress regularly is important for optimizing your recovery journey. If you have any questions or need assistance, feel free to reach out to me.</p>
    <br/><p>Best regards,</p>
    <p>{{admin_name}}</p>
    <p>Your Virtual Assistant</p>
  </body>
</html>`;

export const userCredentialsData = `<br/><br/><div style="
    background: #fff;
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    margin-top: 10px;
  ">
    <p style="margin: 10px 0; font-size: 18px;">
      <strong>Username:</strong> {{user_name}}
    </p>
    <p style="margin: 10px 0; font-size: 18px;">
      <strong>Password:</strong> {{password}}
    </p>
    <p style="margin: 10px 0; font-size: 18px;">
      <strong>URL:</strong> 
      <a href="{{url}}" style="color: #007bff; text-decoration: none;">{{url}}</a>
    </p>
    <p style="margin: 10px 0; font-size: 18px;">
      <strong>Mobile Access Code:</strong> 
      <span style="background: #007bff; color: #fff; padding: 5px 10px; border-radius: 4px;">
        {{invite_code}}
      </span>
    </p>
  </div>`;

export const DEFAULT_CONSENT_FORM_TEMPLATE = `<div style="font-family: Satoshi-Regular;">
<p style="text-align: center;">
    <span style="font-size: 14px; font-weight: bold">Informed Consent to Telehealth Physical Therapy</span>
</p>
<p>
    <br>
</p>
<p>
    <span style="font-size: 14px;">You’ve been referred to VitalFlow for physical therapy to help with pain, injury, or movement problems. Your care will be provided remotely through the VitalFlow platform, a secure HIPAA compliant virtual system with connected mobile applications on iOS and Android.</span>
</p>
<p>
    <br>
</p>
<p>
    <span style="font-size: 14px; font-weight: bold">About Your Care</span>
</p>
<ul>
    <li>
        <span style="font-size: 14px;">You will work with a licensed physical therapist.</span>
    </li>
    <li>
        <span style="font-size: 14px;">Your treatment will be done through video or audio.</span>
    </li>
    <li>
        <span style="font-size: 14px;">Your physical therapist will guide you using observation, verbal instructions, and movement-based exercises.</span>
    </li>
</ul>
<p>
    <br>
</p>
<p>
    <span style="font-size: 14px; font-weight: bold">You may receive:</span>
</p>
<ul>
    <li>
        <span style="font-size: 14px;">Exercise and mobility training</span>
    </li>
    <li>
        <span style="font-size: 14px;">Education on posture and movement</span>
    </li>
    <li>
        <span style="font-size: 14px;">Tips to reduce pain and improve physical function</span>
    </li>
</ul>
<p>
    <br>
</p>
<p>
    <span style="font-size: 14px; font-weight: bold">What to Expect from Telehealth</span>
</p>
<ul>
    <li>
        <span style="font-size: 14px;">No physical contact — care is based on what the therapist sees and hears.</span>
    </li>
    <li>
        <span style="font-size: 14px;">Limits exist — not everything can be treated remotely.</span>
    </li>
    <li>
        <span style="font-size: 14px;">Technology issues may sometimes interrupt sessions.</span>
    </li>
</ul>
<p>
    <br>
</p>
<p>
    <span style="font-size: 14px; font-weight: bold">Privacy and Records</span>
</p>
<ul>
    <li>
        <span style="font-size: 14px;">Session info will be used for treatment and documentation.</span>
    </li>
    <li>
        <span style="font-size: 14px;">If used for research or training, your name and personal details will be removed.</span>
    </li>
    <li>
        <span style="font-size: 14px;">Your records are kept confidential and secure.</span>
    </li>
    <li>
        <span style="font-size: 14px;">You may request a copy of the VitalFlow Privacy Notice at any time.</span>
    </li>
</ul>
<p>
    <br>
</p>
<p>
    <span style="font-size: 14px; font-weight: bold;">Notice of Privacy Practices</span>
</p>
<p>
    <span style="font-size: 14px;">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; font-weight: bold;">THIS NOTICE DESCRIBES HOW MEDICAL INFORMATION ABOUT YOU MAY BE USED AND DISCLOSED AND HOW YOU CAN GET ACCESS TO THIS INFORMATION. PLEASE REVIEW IT CAREFULLY.</span>
</p>
<p>
    <span style="font-size: 14px;">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px;">VitalFlow is committed to protecting the confidentiality of its patients’ personal health information. &nbsp;This Notice of Privacy Practices (“Notice”) describes how we may use and disclose your personal health information and your rights concerning
        your personal health information. &nbsp;This Notice is provided to you pursuant to the Health Insurance Portability and Accountability Act of 1996 and its implementing regulations (“HIPAA”).[4] [KR5]&nbsp;</span>
</p>
<br>
<p>
    <span style="font-size: 14px; ">We are required by law to (i) maintain the privacy of your personal health information; (ii) provide you with this Notice stating our legal duties and privacy practices with respect to your personal health information; (iii) abide by the terms of
        this Notice as it remains in effect; and (iv) notify you following a breach of your personal health information that is not secured in accordance with certain security standards.&nbsp;</span>
</p>
<br>
<p>
    <span style="font-size: 14px; ">We reserve the right to change the terms of this Notice and to make the provisions of the new Notice effective for all personal health information that we maintain. &nbsp;If we change the terms of this Notice, the revised Notice will be made available
        upon request and posted on our website. &nbsp;Copies of the current Notice may be obtained by contacting our Privacy Officer[6] .</span>
</p>
<br>
<p>
    <span style="font-size: 14px; font-weight: bold; ">Uses and Disclosures</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">A. Uses and Disclosures That May Be Made Without Your Consent</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>TREATMENT:</b> We may use and disclose your personal health information as necessary for your treatment. Doctors and nurses and other professionals involved in your care will use information in your medical record and information that you provide about
        your symptoms and reactions to your course of treatment that may include procedures, medications, tests, medical history, etc.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>PAYMENT:</b> We may use and disclose your personal health information as necessary for payment purposes. We may use your information to prepare a bill to send to you or to the person responsible for your payment.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>APPOINTMENTS AND SERVICES:</b> We may contact you to provide appointment reminders or information about your treatment or other health-related benefits and services that may be of interest to you. You have the right to request, and we will accommodate
        reasonable requests by you, to receive communications regarding your personal health information from us by alternative means or at alternative locations. For instance, if you wish appointment reminders to not be left on voicemail or sent to a
        particular address, we will accommodate reasonable requests.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>HEALTH CARE OPERATIONS:</b> We may use and disclose your personal health information as necessary to support the day-to-day activities and management of MovementX. For example, information on the services you received may be used to support budgeting
        and financial reporting, and activities to evaluate and promote quality.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>OTHER USES AND DISCLOSURES:</b> We are also permitted and/or required by law to make certain other uses and disclosures of your personal health information without your authorization for the following:</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Family and Friends:</b> &nbsp;We may disclose your personal health information to a family member or friend who is involved in your medical care or to someone who helps pay for your care. &nbsp;We may also use or
        disclose your personal health information to notify (or assist in notifying) a family member, legally authorized representative or other person responsible for your care of your location, general condition or death. &nbsp;If you are a minor, we
        may release your personal health information to your parents or legal guardians when we are permitted or required to do so under federal and applicable state law.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Third Parties:</b> &nbsp;We may disclose your personal health information to third parties with whom we contract to perform services on our behalf. &nbsp;If we disclose your information to these entities, we will
        have an agreement with them to safeguard your information. &nbsp;Examples of these third parties include, but are not limited to, accreditation agencies, management consultants, quality assurance reviewers, collection agencies, transcription services,
        etc.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Required by Law: &nbsp;We may use or disclose your personal health information to the extent the use or disclosure is required by law. &nbsp;Any such use or disclosure will be made in compliance with the law and
        will be limited to what is required by the law.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;	<b>Public Health Activities: </b> &nbsp;We may disclose your personal health information for public health activities. &nbsp;These activities generally include the following:</span>
</p>
<ul>
    <li>
        <span style="font-size: 14px;">To prevent or control disease, injury or disability</span>
    </li>
    <li>
        <span style="font-size: 14px;">To report child abuse or neglect</span>
    </li>
    <li>
        <span style="font-size: 14px;">To report reactions to medications or problems with products</span>
    </li>
    <li>
        <span style="font-size: 14px;">To notify people of recalls of products they may be using</span>
    </li>
    <li>
        <span style="font-size: 14px;">To notify a person who may have been exposed to a disease or may be at risk for contracting or spreading a disease or condition</span>
    </li>
    <li>
        <span style="font-size: 14px;">To notify the appropriate government authority if we believe you have been the victim of abuse, neglect or domestic violence. &nbsp;We will only make this disclosure if you agree or when otherwise required by law to the make the disclosure.</span>
    </li>
</ul>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Health Oversight Activities:</b> &nbsp;We may disclose your personal health information to a health oversight agency for activities authorized by law. &nbsp;These oversight activities include, for example, audits;
        investigations, proceedings or actions; inspections; and disciplinary actions; or other activities necessary for appropriate oversight of the health care system, government programs and compliance with applicable laws.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>Law Enforcement:</b> &nbsp;We may disclose your personal health information to law enforcement in very limited circumstances, such as to identify or locate suspects, fugitives, witnesses or victims of a crime, to
        report deaths from a crime, and to report crimes that occur on our premises.&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Judicial and Administrative Proceedings: &nbsp;We may disclose information about you in response to an order of a court or administrative tribunal as expressly authorized by such order.&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b>To Avert a Serious Threat to Health or Safety: </b> We may use or disclose your personal health information when necessary to prevent a serious and imminent threat to your health or safety or the health and safety
        of the public or another person. &nbsp;Any disclosure would only be to someone able to help prevent the threat of harm.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Disaster Relief Efforts: </b>&nbsp;We may use or disclose your personal health information to an authorized public or private entity to assist in disaster relief efforts. &nbsp;You may have the opportunity to object
        unless it would impede our ability to respond to emergency circumstances.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b> Coroners, Medical Examiners and Funeral Directors: </b> &nbsp;We may disclose personal health information consistent with applicable law to coroners, medical examiners and funeral directors only to the extent necessary
        to assist them in carrying out their duties.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b> Organ and Tissue Donation: </b> &nbsp;We may disclose personal health information consistent with applicable law to organizations that handle organ, eye or tissue donation or transplantation, only to the extent necessary
        to help facilitate organ or tissue donation or transplantation.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Research: </b> &nbsp;Under certain circumstances, we may also use and disclose information about you for research purposes. &nbsp;All research projects are subject to a special approval process through an appropriate
        committee.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Workers’ Compensation:</b> &nbsp;We may disclose your personal health information as authorized by law to comply with workers’ compensation laws and other similar programs established by law.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Military, Veterans, National Security and Other Government Purposes:</b> &nbsp;If you are a member of the armed forces, we may release your personal health information as required by military command authorities or
        to the Department of Veterans Affairs. &nbsp;We may also disclose your personal health information to authorized federal officials for intelligence and national security purposes to the extent authorized by law.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">· &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Correctional Institutions:</b> If you are or become an inmate of a correctional institution or are in the custody of a law enforcement official, we may disclose to the institution or law enforcement official information
        necessary for the provision of health services to you, your health and safety, the health and safety of other individuals and law enforcement on the premises of the institution and the administration and maintenance of the safety, security and
        good order of the institution. &nbsp;</span>
</p>
<br>
<p>
    <span style="font-size: 14px;  font-weight: bold">B. Uses and Disclosures Based Upon Your Written Authorization</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>MARKETING: </b>We must obtain your written authorization [10] to[11] &nbsp;use and disclose your personal health information for most marketing purposes.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>SALE OF PERSONAL HEALTH INFORMATION: </b> We must obtain your authorization for any disclosure that constitutes the sale of your personal health information.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>PSYCHOTHERAPY NOTES: </b>We must obtain your authorization for most uses and disclosures of psychotherapy notes (private notes of a mental health professional kept separately from a medical record). &nbsp;[12]&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>OTHER USES AND DISCLOSURES: </b> Other uses and disclosures of your personal health information, not described above, will be made only with your written authorization. You may revoke your authorization, at any time, in writing, except to the extent that
        we have taken action in reliance on the authorization.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px;  font-weight : bold">Rights That You Have Regarding Your Personal Health Information (PHI)</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>ACCESS TO YOUR PHI:</b> You have the right to a copy and/or inspect much of the personal</span>
</p>
<p>
    <span style="font-size: 14px; ">health information that we retain on your behalf. All requests for access must be made in writing</span>
</p>
<p>
    <span style="font-size: 14px; ">and signed by you or your legal representative.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>AMENDMENTS TO YOUR PHI: </b> You have the right to request in writing that personal health information that we maintain about you be amended or corrected. We are not obligated to make all requested amendments but will give each request careful consideration.
        All amendment requests must be in writing, signed by you or your legal representative, and must state the reasons for the amendment/correction request.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>RECEIVE CONFIDENTIAL COMMUNICATIONS FROM US BY ALTERNATIVE</b></span>
</p>
<p>
    <span style="font-size: 14px; "><b>MEANS/LOCATIONS: </b> You have the right to request that we communicate with you in a certain way or at a certain location. Your request must be in writing and specify how and where you would like to be contacted. We will accommodate all reasonable requests.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>MANAGE DISCLOSURE OF RESTRICTIONS ON CERTAIN USES AND DISCLOSURES OF YOUR PHI: </b> You have the right to ask us not to use or disclose any part of your personal health information for purposes of treatment, payment or healthcare operations. &nbsp;While
        we will consider your request, we are only required to agree to restrict a disclosure to a health plan for purposes of payment or healthcare operations (but not for treatment) if the information applies solely to a healthcare item or service for
        which we have been paid out of pocket in full. &nbsp;If we agree to a restriction, we will not use or disclose your personal health information in violation of that restriction unless it is needed to provide emergency treatment. &nbsp;[13] We
        will not agree to restrictions on personal health information uses or disclosures that are legally required or necessary to administer our business. All restriction requests must be in writing and signed by you or your legal representative.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>ACCOUNTING OF CERTAIN DISCLOSURES OF YOUR PHI: </b>You have the right to receive an accounting of how and to whom your personal health information has been disclosed. &nbsp;All accounting requests must be in writing and signed by you or your legal representative.[14]&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; "><b>OBTAIN A PAPER COPY OF THIS NOTICE:</b> You have the right to obtain a paper copy of this Notice upon request, even if you agreed to accept this Notice electronically. &nbsp;[15]&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">State Law</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">We will not use or share your information if state law prohibits it. &nbsp;Some states have laws that are stricter than the federal privacy regulations, such as laws protecting HIV/AIDS information or mental health information. &nbsp;If a state law
        applies to us and is stricter or places limits on the ways we can use or share your health information, we will follow the state law. &nbsp;If you would like more information about any applicable state laws, please ask our Privacy Officer.</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px;  font-weight: bold">Questions or Complaints</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">If you have any questions or want more information about this Notice or how to exercise your personal health information rights, you can do so by contacting:</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px;">VitalFlow, Inc</span>
</p>
<p>
    <span style="font-size: 14px;">Dr. Neha Narula, HIPAA compliance officer </span>
</p>
<p>
    <span style="font-size: 14px;">28505 SW Grahams Ferry Rd.</span>
</p>
<p>
    <span style="font-size: 14px;">Wilsonville, OR 97070&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px;">(503) 290-4943</span>
</p>
<p>
    <span style="font-size: 14px; ">&nbsp;</span>
</p>
<p>
    <span style="font-size: 14px; ">If you believe your privacy rights have been violated, you may file a complaint with our Privacy Officer or with the Office for Civil Rights: Centralized Case Management Operations, U.S. Department of Health and Human Services, 200 Independence Avenue,
        S.W., Room 509F HHH Bldg., Washington, D.C. 20201 or OCRComplaint@hhs.gov.&nbsp;</span>
</p>
</div>
`;