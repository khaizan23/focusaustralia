import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Choose your account type to get started
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Client */}
          <Link href="/register/client">
            <Card className="cursor-pointer p-3 hover:border-primary h-full hover:bg-black/80 hover:text-white group hover:shadow-2xl ease-in-out hover:-translate-y-1 transition duration-200">
              <CardHeader>
                <CardTitle className="text-lg">👤 Client</CardTitle>
                <CardDescription className="group-hover:text-white">
                  Looking for job opportunities in Australia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs group-hover:text-white">
                  Upload your CV, add work experience, and get discovered by
                  employers.
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Employer */}
          <Link href="/register/employer">
            <Card className="cursor-pointer p-3 hover:border-primary h-full hover:bg-black/80 hover:text-white group hover:shadow-2xl ease-in-out hover:-translate-y-1 transition duration-200">
              <CardHeader>
                <CardTitle className="text-lg">🏢 Employer</CardTitle>
                <CardDescription className="group-hover:text-white">
                  Looking for candidates to hire
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs group-hover:text-white">
                  Browse qualified candidates and find the right fit for your
                  company.
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}









// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import Link from "next/link";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardFooter,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label"
// import { supabase } from "@/lib/supabase"

// export default function RegisterPage() {
//   const [fullName, setFullName] = useState("")
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [error, setError] = useState("")
//   const [loading, setLoading] = useState(false)

//   async function handleRegister() {
//     setError("")

//     // Check kung magkapareho ang password
//     if (password !== confirmPassword) {
//       setError("Passwords do not match")
//       return
//     }

//     setLoading(true)

//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: { full_name: fullName }
//       }
//     })

//     // if (error) {
//     //   setError(error.message)
//     //   setLoading(false)
//     //   return
//     // }

//     if (error) {
//         console.log("Full error:", JSON.stringify(error))
//         setError(error.message)
//         setLoading(false)
//         return
//       }

//     // Mag-redirect sa login page
//     window.location.href = "/login"
//   }

//   return (
//     <main className="flex min-h-screen items-center justify-center bg-muted">
//       <Card className="w-full max-w-sm">
//         <CardHeader>
//           <CardTitle className="text-2xl pt-5">Sign Up</CardTitle>
//           <CardDescription>
//             Create a new account to get started.
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <div className="flex flex-col gap-4">
//             <div className="flex flex-col gap-2">
//               <Label>Full Name</Label>
//               <Input
//                 type="text"
//                 placeholder="Enter your full name"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//               />
//             </div>

//             <div className="flex flex-col gap-2">
//               <Label>Email</Label>
//               <Input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//               />
//             </div>

//             <div className="flex flex-col gap-2">
//               <Label>Password</Label>
//               <Input
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//               />
//             </div>

//             <div className="flex flex-col gap-2">
//               <Label>Confirm Password</Label>
//               <Input
//                 type="password"
//                 placeholder="Confirm your password"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//               />
//             </div>

//             {error && <p className="text-red-500 text-sm">{error}</p>}

//             <Button
//               className="w-full py-2"
//               onClick={handleRegister}
//               disabled={loading}
//             >
//               {loading ? "Registering..." : "Register"}
//             </Button>
//           </div>
//         </CardContent>
//         <CardFooter className="text-center justify-center text-sm text-muted-foreground">
//           Already have an account?
//           <Link href="/login" className="text-black px-1 hover:underline "> Sign in</Link>
//         </CardFooter>
//       </Card>
//     </main>
//   );
// }
