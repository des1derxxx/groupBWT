import { render, screen, fireEvent } from "@testing-library/react";
import { ImageTransferModal } from "./ImageTransferModal";
import type { GalleryItem } from "@/api/galleryApi";
import "@testing-library/jest-dom";

describe("ImageTransferModal Component", () => {
  const mockUser = {
    id: "user-123",
    username: "testuser",
    email: "test@example.com",
  };

  const mockGalleries: GalleryItem[] = [
    {
      id: "1",
      title: "Природа",
      imagesCount: 5,
      createdAt: "2025-01-01",
      description: "Тестовое описание 1",
      user: mockUser,
    },
    {
      id: "2",
      title: "Город",
      imagesCount: 3,
      createdAt: "2025-01-02",
      description: "Тестовое описание 2",
      user: mockUser,
    },
    {
      id: "3",
      title: "Космос",
      imagesCount: 10,
      createdAt: "2025-01-03",
      description: "Тестовое описание 3",
      user: mockUser,
    },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    AllGallery: mockGalleries,
    currentGalleryId: "1",
    selectedGalleryId: "",
    onGallerySelect: jest.fn(),
    isPending: false,
    mode: "move" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("не должен ничего рендерить, если isOpen={false}", () => {
    const { container } = render(
      <ImageTransferModal {...defaultProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("должен фильтровать текущую галерею из списка выбора", () => {
    render(<ImageTransferModal {...defaultProps} currentGalleryId="1" />);

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(screen.queryByText("Природа")).not.toBeInTheDocument();
  });

  it("должен вызывать onGallerySelect при выборе галереи", () => {
    render(<ImageTransferModal {...defaultProps} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "2" } });

    expect(defaultProps.onGallerySelect).toHaveBeenCalledWith("2");
  });

  it("кнопка подтверждения должна быть заблокирована, если галерея не выбрана", () => {
    render(<ImageTransferModal {...defaultProps} selectedGalleryId="" />);
    const confirmBtn = screen.getByRole("button", { name: "Переместить" });
    expect(confirmBtn).toBeDisabled();
  });

  it("должен отображать текст загрузки и блокировать кнопку при isPending={true}", () => {
    render(
      <ImageTransferModal
        {...defaultProps}
        isPending={true}
        selectedGalleryId="2"
      />
    );
    expect(screen.getByText("Перемещение...")).toBeInTheDocument();
    const pendingBtn = screen.getByRole("button", { name: "Перемещение..." });
    expect(pendingBtn).toBeDisabled();
  });

  it("должен вызывать onClose при клике на кнопку 'Отмена'", () => {
    render(<ImageTransferModal {...defaultProps} />);
    const cancelBtn = screen.getByRole("button", { name: /отмена/i });
    fireEvent.click(cancelBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
