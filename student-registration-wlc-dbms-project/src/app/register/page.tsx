import RegistrationForm from "./RegistrationForm";
import { getPrograms, getYears } from "@/actions/programs.server";

export default async function RegisterPage() {
    const programs = await getPrograms();
    const years = await getYears();

    return <RegistrationForm programs={programs} years={years} />;
}
