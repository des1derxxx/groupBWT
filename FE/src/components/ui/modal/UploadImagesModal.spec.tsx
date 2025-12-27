import { render, screen, fireEvent } from "@testing-library/react";
import { UploadImagesModal } from "./UploadImagesModal";
import { notifications } from "@mantine/notifications";
import "@testing-library/jest-dom";
jest.mock("@mantine/notifications", () => ({
  notifications: {
    show: jest.fn(),
  },
}));
global.URL.createObjectURL = jest.fn(() => "blob:test-url");

describe("UploadImagesModal Component", () => {
  const mockProps = {
    isOpen: true,
    selectedFiles: [],
    isPending: false,
    onClose: jest.fn(),
    onFilesAdd: jest.fn(),
    onFileRemove: jest.fn(),
    onUpload: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("не рендерит ничего, если isOpen={false}", () => {
    const { container } = render(
      <UploadImagesModal {...mockProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });
  it("должен вызывать onClose при клике на 'Отмена'", () => {
    render(<UploadImagesModal {...mockProps} />);
    fireEvent.click(screen.getByRole("button", { name: /отмена/i }));
    expect(mockProps.onClose).toHaveBeenCalled();
  });
  it("должен блокировать кнопку загрузки, если файлы не выбраны", () => {
    render(<UploadImagesModal {...mockProps} selectedFiles={[]} />);
    const uploadBtn = screen.getByRole("button", { name: /загрузить \(0\)/i });
    expect(uploadBtn).toBeDisabled();
  });
  it("должен отображать выбранные файлы и их количество", () => {
    const selectedFiles = [
      { file: new File([], "image1.png"), preview: "url1" },
      { file: new File([], "image2.png"), preview: "url2" },
    ];
    render(<UploadImagesModal {...mockProps} selectedFiles={selectedFiles} />);

    expect(screen.getByText("Выбрано изображений: 2")).toBeInTheDocument();
    expect(screen.getByText("image1.png")).toBeInTheDocument();
    expect(screen.getByText("image2.png")).toBeInTheDocument();
  });

  it("должен вызывать onFileRemove при нажатии на 'Удалить' у конкретного фото", () => {
    const selectedFiles = [{ file: new File([], "test.jpg"), preview: "url1" }];
    render(<UploadImagesModal {...mockProps} selectedFiles={selectedFiles} />);

    fireEvent.click(screen.getByRole("button", { name: /удалить/i }));
    expect(mockProps.onFileRemove).toHaveBeenCalledWith(0);
  });
  it("валидация: должен показать ошибку, если файл больше 5МБ", async () => {
    render(<UploadImagesModal {...mockProps} />);
    const input = screen.getByLabelText(/выбрать изображения/i);
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "big.png", {
      type: "image/png",
    });

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Файл слишком большой",
        color: "red",
      })
    );
    expect(mockProps.onFilesAdd).not.toHaveBeenCalled();
  });

  it("валидация: должен показать ошибку при кириллице в названии файла", () => {
    render(<UploadImagesModal {...mockProps} />);
    const input = screen.getByLabelText(/выбрать изображения/i);
    const badFile = new File([], "картинка.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [badFile] } });
    expect(notifications.show).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Недопустимое имя файла",
      })
    );
    expect(mockProps.onFilesAdd).not.toHaveBeenCalled();
  });
  it("должен успешно добавить файлы, если они проходят валидацию", () => {
    render(<UploadImagesModal {...mockProps} />);
    const input = screen.getByLabelText(/выбрать изображения/i);
    const validFile = new File([], "vacation_2025.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [validFile] } });
    expect(mockProps.onFilesAdd).toHaveBeenCalledWith([
      { file: validFile, preview: "blob:test-url" },
    ]);
  });
  it("состояние загрузки: должен менять текст кнопки и блокировать её", () => {
    const selectedFiles = [{ file: new File([], "1.png"), preview: "url1" }];
    render(
      <UploadImagesModal
        {...mockProps}
        selectedFiles={selectedFiles}
        isPending={true}
      />
    );

    const btn = screen.getByRole("button", { name: /загрузка.../i });
    expect(btn).toBeDisabled();
  });
});
