import { useLocaleContext } from "@/contexts/locale/context";
import RoundButton from "@/components/ui/Button/index";
import { LocaleCode, locales } from "@/i18n/langs";
import * as Select from "@radix-ui/react-select";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { SpinnerCircular } from "spinners-react";

const getImagePath = (flag: string) => `./images/flags/svg/rounded/${flag}.svg`;

interface LanguageItem {
  value: LocaleCode;
  label: string;
  flag: string;
}

const langs: LanguageItem[] = Object.keys(locales).map((key) => ({
  value: key as LocaleCode,
  label: locales[key as LocaleCode].label,
  flag: locales[key as LocaleCode].flag,
}));

const LanguageSelector = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { locale, updateLocale, isRtl } = useLocaleContext();

  const onLanguageSelect = async (lang: LocaleCode) => {
    setLoading(true);
    try {
      await updateLocale(lang);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Select.Root value={locale} onValueChange={onLanguageSelect}>
      <div className="relative">
        <Select.Trigger asChild>
          <RoundButton className="size-9 rounded-full flex items-center justify-center gap-1">
            {loading ? (
              <SpinnerCircular size={50} thickness={150} speed={100} color="rgba(69, 172, 57, 1)" secondaryColor="rgba(172, 144, 57, 0.31)" />
            ) : (
              <Image width={48} height={48} className="size-7" src={getImagePath(locales[locale as LocaleCode].flag)} alt={locale} />
            )}
          </RoundButton>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="dark:border-dark-500  dark:bg-dark-700 z-101 w-min min-w-[10rem] overflow-y-auto rounded-lg border border-gray-300 bg-white py-1 font-medium shadow-lg shadow-gray-200/50 outline-hidden focus-visible:outline-hidden ltr:right-0 rtl:left-0 dark:shadow-none"
            position="popper"
            sideOffset={8}
            align="end"
            avoidCollisions
          >
            <Select.Viewport>
              {langs.map((lang) => (
                <Select.Item
                  dir={isRtl ? "rtl" : "ltr"}
                  key={lang.value}
                  value={lang.value}
                  className={clsx(
                    "relative flex cursor-pointer px-4 py-2 transition-colors select-none outline-none",
                    "data-[highlighted]:dark:bg-dark-600 data-[highlighted]:bg-gray-100",
                    "data-[state=checked]:bg-primary-600 data-[state=checked]:bg-sky-600 data-[state=checked]:text-white",
                    "data-[state=unchecked]:dark:text-dark-100 data-[state=unchecked]:text-gray-800"
                  )}
                >
                  <Select.ItemText>
                    <div className={`flex space-x-3`}>
                      <Image width={36} height={36} className="size-5" src={getImagePath(lang.flag)} alt={lang.value} />
                      <span className="block truncate">{lang.label}</span>
                    </div>
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </div>
    </Select.Root>
  );
};

export { LanguageSelector };
