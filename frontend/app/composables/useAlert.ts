import Swal from "sweetalert2";
import type {
  SweetAlertResult,
  SweetAlertOptions,
  SweetAlertPosition,
} from "sweetalert2";

const position: SweetAlertPosition = "center";
const confirmOptions = {
  title: "Conferma l'operazione",
  position,
  confirmButtonText: "Conferma",
  showCancelButton: true,
  cancelButtonText: "Annulla",
  customClass: { confirmButton: "swal2-confirm" },
};

const dangerConfirmOptions = {
  ...confirmOptions,
  ...{ customClass: { confirmButton: "swal2-deny" } },
};

const alertOptions = {
  title: "Avviso",
  position,
  confirmButtonText: "Ok",
};

export const useConfirm = async (
  text: string,
  options: SweetAlertOptions = {},
): Promise<boolean> => {
  const swo: SweetAlertOptions = {
    html: text.replace(/\n/g, "<br>"),
    text,
    ...confirmOptions,
    ...options,
  };
  const confirm: SweetAlertResult = await Swal.fire(swo);
  return confirm.isConfirmed;
};

export const useDangerConfirm = async (
  text: string,
  options: SweetAlertOptions = {},
): Promise<boolean> => {
  const confirm: SweetAlertResult = await Swal.fire({
    html: text.replace(/\n/g, "<br>"),
    text,
    ...dangerConfirmOptions,
    ...options,
  });
  return confirm.isConfirmed;
};

export const useAlert = async (
  text: string,
  options: SweetAlertOptions = {},
): Promise<void> => {
  await Swal.fire({
    html: text.replace(/\n/g, "<br>"),
    text,
    ...alertOptions,
    ...options,
  });
};
