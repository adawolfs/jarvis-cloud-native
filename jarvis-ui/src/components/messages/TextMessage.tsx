import clsx from "clsx";

type TextMessageProps = {
  text: string;
  isUser: boolean;
};

export function TextMessage({ text, isUser }: TextMessageProps) {
  return (
    <div
      className={clsx("flex flex-row gap-2", {
        "justify-end py-2": isUser,
      })}
    >
      <div
        className={clsx("rounded-[16px]", {
          "ml-4 max-w-[90%] border border-cyan-400/30 bg-cyan-400/15 px-4 py-2 text-cyan-50":
            isUser,
          "mr-4 max-w-[90%] border border-sky-400/20 bg-[#07182f] px-4 py-2 text-cyan-100":
            !isUser,
        })}
      >
        <span className="whitespace-pre-wrap break-words text-sm sm:text-base">
          {text}
        </span>
      </div>
    </div>
  );
}
