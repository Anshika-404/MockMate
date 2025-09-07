"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { FormProvider } from "react-hook-form"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import FormField from "./FormField"
import {useRouter} from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client"
import { signUp, signIn} from "@/lib/actions/auth.action"


const authFormSchema = (type: FormType) => {
    return z.object({
        name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(6),
    })
}
type AuthFormProps = {
    type: "sign-in" | "sign-up";
};

const AuthForm = ({ type }: AuthFormProps) => {
    const router = useRouter();
    const formSchema = authFormSchema(type);
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    
  async  function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if(type === "sign-in") {
                const { email, password } = values;
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                
                const idToken = await userCredential.user.getIdToken();

                if(!idToken) {
                    toast.error("Failed to sign in. Please try again.");
                    return;
                }

                await signIn({
                    email,
                    idToken,
                })

                toast.success("Signed in successfully!");
                router.push("/");
            } else {
                const { name, email, password} = values;

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                const result = await signUp({
                    uid: userCredential.user.uid,
                    name: name!,
                    email,  
                    password,
                })

                if(!result?.success) {
                    toast.error(result?.message);
                    return;
                }

                toast.success("Account created successfully!");
                router.push("/sign-in");
            }
        } 
        catch (error) {
            console.log(error);
            toast.error('Something went wrong. Please try again later.');
        }
    }

    const isSignIn = type === "sign-in";
    return (
        <div className="card-border lg:min-w-[566px]">
            <div className="flex flex-col gap-6 card py-14 px-10">
                <div className="flex flex-row gap-2 justify-center">
                    <Image
                        src="/logo.svg"
                        alt="Logo"
                        height={32}
                        width={38}
                    />
                    <h2 className="text-primary-100">MockMate</h2>
                </div>

                <h3>Practice job interview with AI</h3>

                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
                        {!isSignIn && (
                            <FormField 
                                control={form.control} 
                                name="name" 
                                label="Name" 
                                placeholder="Your name" 
                                type="text" />
                        )}
                        <FormField 
                            control={form.control}
                            name="email"
                            label="Email"
                            placeholder="Your email"
                            type="email"
                        />
                        <FormField 
                            control={form.control}
                            name="password"
                            label="Password"
                            placeholder="Enter your password"
                            type="password"
                        />
                        <Button className="btn" type="submit">{isSignIn ? 'Sign in' : 'Create an Account'}</Button>
                    </form>
                </FormProvider>
                <p className="text-center">
                    {isSignIn ? "Don't have an account? " : "Already have an account? "}
                    <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="font-bold text-user-primary ml-1">
                        {isSignIn ? "Sign up" : "Sign in"}
                    </Link>
                </p>
            </div>
        </div>
    )
}
export default AuthForm