import type { FC, ReactNode } from "react";

interface FormWrapperProps {
  children?: ReactNode;
  title?: string;
  description?: string;
  bottom?: {
    text: string;
    buttonLabel: string;
    buttonOnClick?: () => void;
  };
  hasHeader: boolean;
}

const FormWrapper: FC<FormWrapperProps> = ({
  title,
  description,
  children,
  bottom,
  hasHeader = false,
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 w-screen h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 overflow-auto ${hasHeader ? "pt-24" : ""}`}
      >
        <div className="relative w-full max-w-lg my-8">
          <div className="bg-gray-800 bg-opacity-50 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-gray-700">
            <div className="text-center mb-8">
              {!!title && (
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                  {title}
                </h1>
              )}
              {!!description && (
                <p className="text-gray-400 text-lg">{description}</p>
              )}
            </div>
            {children}

            {bottom && (
              <div className="text-center mt-6">
                <p className="text-gray-400 flex items-center gap-4 justify-center">
                  <span>{bottom.text}</span>
                  <button
                    type="button"
                    onClick={() => bottom.buttonOnClick?.()}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                  >
                    {bottom.buttonLabel}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FormWrapper;
