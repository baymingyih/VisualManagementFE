import { Button, Drawer, Form, Input, Select, SelectProps, message } from "antd";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateBillingAccount } from "@/pages/api/BillingAPIs";
import { set } from "lodash";

const ChangeBillingAcc = ({
    billingAccDrawer,
    setBillingAccDrawer,
    accDetails,
    setAccDetails,
    countries
}: {
    billingAccDrawer: boolean;
    setBillingAccDrawer: Dispatch<SetStateAction<boolean>>;
    accDetails: any;
    setAccDetails: Dispatch<any>;
    countries: any;
}) => {
    const [form] = Form.useForm();

    const [hasChangedFirst, setHasChangedFirst] = useState(false);
    const [hasChangedLast, setHasChangedLast] = useState(false);
    const [hasChangedAddress1, setHasChangedAddress1] = useState(false);
    const [hasChangedAddress2, setHasChangedAddress2] = useState(false);
    const [hasChangedAddress3, setHasChangedAddress3] = useState(false);
    const [hasChangedZip, setHasChangedZip] = useState(false);
    const [hasChangedCountry, setHasChangedCountry] = useState(false);
    const [hasChangedState, setHasChangedState] = useState(false);
    const [hasChangedCity, setHasChangedCity] = useState(false);
    const [hasChangedEmail, setHasChangedEmail] = useState(false);
    const [hasChangedPhone, setHasChangedPhone] = useState(false);

    const [selectedCountry, setSelectedCountry] = useState("");

    const { isLoading: updateBillingAccLoading, mutate: editBillingAcc } = useMutation({
        mutationKey: ["billing_updateBillingAcc"],
        mutationFn: (obj: {
            customerId: string;
            firstName: string;
            lastName: string;
            address1: string;
            address2: string;
            address3: string;
            zip: string;
            country: string;
            state: string;
            city: string;
            email: string;
            phone: string;
        }) => updateBillingAccount(obj),
        onSuccess: ({ data }) => {
            console.log(data)
            message.success("Billing account updated successfully");
            setAccDetails({
                customerId: data.id,
                first_name: data.billing_address.first_name,
                last_name: data.billing_address.last_name,
                line1: data.billing_address.line1,
                line2: data.billing_address.line2 ? data.billing_address.line2 : "",
                line3: data.billing_address.line3 ? data.billing_address.line3 : "",
                zip: data.billing_address.zip,
                country: data.billing_address.country,
                state: data.billing_address.state ? data.billing_address.state : "",
                city: data.billing_address.city ? data.billing_address.city : "",
                email: data.billing_address.email,
                phone: data.billing_address.phone
                    ? data.billing_address.phone.charAt(0) === "+"
                        ? data.billing_address.phone.split(" ").slice(1).join("")
                        : data.billing_address.phone
                    : "",
                credits: data.refundable_credits
            });
            setBillingAccDrawer(false);
        },
    });

    const onBillingAccDrawerFinish = (values: any) => {
        editBillingAcc({
            customerId: accDetails.customerId,
            firstName: values.firstName,
            lastName: values.lastName,
            address1: values.address1,
            address2: values.address2,
            address3: values.address3,
            zip: values.zip,
            country: values.country,
            state: values.state,
            city: values.city,
            email: values.email,
            phone: values.phone,
        });
    };

    useEffect(() => {
        form.setFieldsValue({
            firstName: accDetails?.first_name,
            lastName: accDetails?.last_name,
            address1: accDetails?.line1,
            address2: accDetails?.line2,
            address3: accDetails?.line3,
            zip: accDetails?.zip,
            country: accDetails?.country,
            state: accDetails?.state,
            city: accDetails?.city,
            email: accDetails?.email,
            phone: accDetails?.phone,
        });
        setHasChangedFirst(false);
        setHasChangedLast(false);
        setHasChangedAddress1(false);
        setHasChangedAddress2(false);
        setHasChangedAddress3(false);
        setHasChangedZip(false);
        setHasChangedCountry(false);
        setHasChangedState(false);
        setHasChangedCity(false);
        setHasChangedEmail(false);
        setHasChangedPhone(false);

        setSelectedCountry(accDetails?.country);
    }, [form, accDetails, billingAccDrawer]);

    const country_options: SelectProps["options"] = countries.countries.countries.map((country: any) => {
        return {
            value: country.country_code,
            label: country.country_name,
        };
    });

    return (
        <>
            <Drawer open={billingAccDrawer} onClose={() => setBillingAccDrawer(false)} width={700}>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "20px" }}>
                    Edit Billing Account
                </div>
                <Form onFinish={onBillingAccDrawerFinish} layout="vertical" form={form}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Form.Item
                            name="firstName"
                            label="First Name"
                            rules={[{ required: true, message: "" }]}
                            style={{ width: "47%" }}>
                            <Input
                                onChange={(e) => {
                                    setHasChangedFirst(e.target.value !== accDetails.first_name);
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="lastName"
                            label="Last Name"
                            rules={[{ required: true, message: "" }]}
                            style={{ width: "47%" }}>
                            <Input
                                onChange={(e) => {
                                    setHasChangedLast(e.target.value !== accDetails.last_name);
                                }}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="Address">
                        <Input.Group compact>
                            <Form.Item
                                name="address1"
                                label="Line 1"
                                rules={[{ required: true, message: "" }]}
                                style={{ width: "100%" }}
                                noStyle>
                                <Input
                                    onChange={(e) => {
                                        setHasChangedAddress1(e.target.value !== accDetails.line1);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                name="address2"
                                // label="Line 2"
                                // rules={[{ required: true, message: '' }]}
                                style={{ width: "100%", margin: "10px 0" }}
                                // noStyle
                            >
                                <Input
                                    onChange={(e) => {
                                        setHasChangedAddress2(e.target.value !== accDetails.line2);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item
                                name="address3"
                                // label="Address Line 3"
                                // rules={[{ required: true, message: '' }]}
                                style={{ width: "100%", marginBottom: "0" }}
                                // noStyle
                            >
                                <Input
                                    onChange={(e) => {
                                        setHasChangedAddress3(e.target.value !== accDetails.line3);
                                    }}
                                />
                            </Form.Item>
                        </Input.Group>
                    </Form.Item>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Form.Item
                            name="zip"
                            label="Zip Code"
                            rules={[{ required: true, message: "" }]}
                            style={{ width: "47%" }}>
                            <Input
                                onChange={(e) => {
                                    setHasChangedZip(e.target.value !== accDetails.zip);
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="country"
                            label="Country"
                            rules={[{ required: true, message: "" }]}
                            style={{ width: "47%" }}>
                            <Select
                                options={country_options}
                                showSearch={true}
                                optionFilterProp="label"
                                onChange={(v, o) => {
                                    setHasChangedCountry(v !== accDetails.country);
                                    setSelectedCountry(v);
                                }}
                            />
                        </Form.Item>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <Form.Item
                            name="state"
                            label="State"
                            // rules={[{ required: true, message: '' }]}
                            style={{ width: "47%" }}>
                            <Input
                                onChange={(e) => {
                                    setHasChangedState(e.target.value !== accDetails.state);
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="city"
                            label="City"
                            // rules={[{ required: true, message: '' }]}
                            style={{ width: "47%" }}>
                            <Input
                                onChange={(e) => {
                                    setHasChangedCity(e.target.value !== accDetails.city);
                                }}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                            { required: true, message: "" },
                            { type: "email", message: "Invalid email" },
                        ]}
                        style={{ width: "100%" }}>
                        <Input
                            onChange={(e) => {
                                setHasChangedEmail(e.target.value !== accDetails.email);
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Contact Number"
                        rules={[{ required: true, message: "" }]}
                        style={{ width: "47%" }}>
                        <Input
                            prefix={"+" + countries.countries.countries.find((item: { [x: string]: any; }) => item["country_code"] === selectedCountry)?.phone_code}
                            onChange={(e) => {
                                setHasChangedPhone(e.target.value !== accDetails.phone);
                            }}
                        />
                    </Form.Item>
                    <div style={{ textAlign: "center" }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ width: "20%", marginTop: "20px" }}
                            disabled={
                                !hasChangedFirst &&
                                !hasChangedLast &&
                                !hasChangedAddress1 &&
                                !hasChangedAddress2 &&
                                !hasChangedAddress3 &&
                                !hasChangedZip &&
                                !hasChangedCountry &&
                                !hasChangedState &&
                                !hasChangedCity &&
                                !hasChangedEmail &&
                                !hasChangedPhone
                            }
                            loading={updateBillingAccLoading}>
                            Save changes
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </>
    );
};

export default ChangeBillingAcc;
