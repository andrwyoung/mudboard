// NOT USED (for now). this is the simple password thing we have

import { useState } from "react";
import { Input } from "../ui/input";
import { toast } from "sonner";

export default function PasswordForm({
  onSubmit,
  placeholder = "Enter password",
  buttonLabel = "Submit",
}: {
  onSubmit: (password: string) => void;
  placeholder?: string;
  buttonLabel?: string;
}) {
  const [password, setPassword] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();

        if (password.trim() === "") {
          toast.error("Password must at least have something");
          return;
        }

        onSubmit(password);
      }}
      className="flex flex-col gap-2 p-1"
    >
      <Input
        placeholder={placeholder}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className=" "
      />
      {/* <Button type="submit" variant="secondary">
        {buttonLabel}
      </Button> */}
      <button
        type="submit"
        className="cursor-pointer hover:secondary text-sm text-primary-darker
        transition-all duration-200 self-start px-2 py-0.5 bg-secondary hover:primary-foreground
         rounded-sm w-full"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
