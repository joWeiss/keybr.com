import { clsx } from "clsx";
import { type ReactNode, useEffect, useState } from "react";
import { handleHotkeys } from "../../utils/hotkeys.ts";
import * as iconStyles from "../icon/Icon.module.less";
import * as styles from "./OptionList.module.less";
import {
  type OptionListOption,
  type OptionListProps,
} from "./OptionList.types.ts";

export function OptionList({
  className,
  disabled,
  options,
  tabIndex,
  title,
  value,
  onBlur,
  onFocus,
  onSelect,
}: OptionListProps): ReactNode {
  const [focused, setFocused] = useState(false);
  const {
    open,
    setOpen,
    option,
    selectedOption,
    handleOpen,
    handleSelect,
    handleNavigate,
    handleSubmit,
  } = useOptionList({
    disabled,
    options,
    value,
    onSelect,
  });
  return (
    <span
      className={clsx(
        styles.optionList,
        focused && styles.focused,
        disabled && styles.disabled,
        className,
      )}
      tabIndex={disabled ? undefined : tabIndex ?? 0}
      title={title}
      onBlur={(event) => {
        if (!disabled) {
          setFocused(false);
          setOpen(false);
          if (onBlur != null) {
            onBlur(event);
          }
        }
      }}
      onFocus={(event) => {
        if (!disabled) {
          setFocused(true);
          if (onFocus != null) {
            onFocus(event);
          }
        }
      }}
      onKeyDown={handleHotkeys(
        ["Space", handleOpen],
        ["Enter", handleSubmit],
        ["Home", () => handleNavigate("first")],
        ["ArrowUp", () => handleNavigate("prev")],
        ["ArrowDown", () => handleNavigate("next")],
        ["End", () => handleNavigate("last")],
        ["ArrowLeft", () => {}],
        ["ArrowRight", () => {}],
        ["PageUp", () => {}],
        ["PageDown", () => {}],
      )}
    >
      <span
        className={styles.placeholder}
        onClick={(event) => {
          event.preventDefault();
          handleOpen();
        }}
      >
        <span className={styles.placeholderName}>{option.name}</span>
        <span className={styles.placeholderArrow}>
          {open ? "\u25BC" : "\u25BA"}
        </span>
      </span>
      {open && (
        <Menu
          options={options}
          selectedOption={selectedOption}
          onSelect={(option) => {
            handleSelect(option);
          }}
          onSubmit={(option) => {
            setOpen(false);
            if (onSelect != null) {
              onSelect(option.value);
            }
          }}
        />
      )}
    </span>
  );
}

function useOptionList({
  options,
  disabled,
  value,
  onSelect,
}: OptionListProps) {
  const option = options.find((option) => option.value === value) ?? {
    value: "",
    name: "-",
  };

  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(option);

  const handleOpen = (): void => {
    if (disabled) {
      return;
    }
    if (!open) {
      setOpen(true);
      setSelectedOption(option);
    } else {
      setOpen(false);
    }
  };

  const handleSelect = (option: OptionListOption): void => {
    if (disabled) {
      return;
    }
    setSelectedOption(option);
  };

  const handleNavigate = (dir: "first" | "prev" | "next" | "last"): void => {
    if (disabled) {
      return;
    }
    if (!open) {
      setOpen(true);
      setSelectedOption(option);
    } else {
      const { length } = options;
      let index = options.indexOf(selectedOption);
      if (index === -1) {
        index = 0;
      }
      switch (dir) {
        case "first":
          index = 0;
          break;
        case "prev":
          index -= 1;
          if (index < 0) {
            index = length - 1;
          }
          break;
        case "next":
          index += 1;
          if (index >= length) {
            index = 0;
          }
          break;
        case "last":
          index = length - 1;
          break;
      }
      setSelectedOption(options[index]);
    }
  };

  const handleSubmit = (): void => {
    if (disabled) {
      return;
    }
    if (open) {
      setOpen(false);
      if (onSelect != null) {
        onSelect(selectedOption.value);
      }
    }
  };

  return {
    open,
    setOpen,
    option,
    selectedOption,
    handleOpen,
    handleSelect,
    handleNavigate,
    handleSubmit,
  };
}

function Menu({
  options,
  selectedOption,
  onSelect,
  onSubmit,
}: {
  readonly options: readonly OptionListOption[];
  readonly selectedOption: OptionListOption;
  readonly onSelect: (value: OptionListOption) => void;
  readonly onSubmit: (value: OptionListOption) => void;
}): ReactNode {
  useEffect(() => {
    // Scroll the selected item.
  }, []);
  return (
    <span role="menu" className={styles.list}>
      {options.map((option, index) => (
        <span
          key={index}
          role="menuitem"
          className={clsx(
            styles.item,
            iconStyles.altIcon,
            option === selectedOption && styles.item_selected,
          )}
          onClick={(event) => {
            event.preventDefault();
            onSubmit(option);
          }}
          onMouseOver={(event) => {
            event.preventDefault();
            onSelect(option);
          }}
        >
          {option.name}
        </span>
      ))}
    </span>
  );
}
