import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DetailContainer,
  BreadcrumbNav,
  ItemHeader,
  ActionsNav,
  FieldsSection,
  StyledLink,
} from "./ItemDetailPage.styles";
import {
  useInventoryActions,
  useInventoryData,
} from "../context/InventoryContext";
import { ALL_FIELDS } from "../data/fieldConfig";
import EditDialog from "../components/ui/EditDialog.component";
import ConfirmDialog from "../components/ui/ConfirmDialog.component";

function ItemDetailPage() {
  // Get navigation and URL parameters
  const navigate = useNavigate();
  const { id } = useParams();
  // Access inventory data and actions from context
  const { items, isLoading, error } = useInventoryData();
  const { archiveItem, unarchiveItem, deleteItem } = useInventoryActions();
  // Local state for edit mode and delete confirmation dialog
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Find the item based on the ID from the URL
  const item = items.find((entry) => String(entry.id) === String(id));
  // Helper function to format field values for display

  useEffect(() => {
    if (isEditing && item?.ItemName) {
      document.title = `Editing: ${item.ItemName} - Kitchen Inventory`;
    } else if (item?.ItemName) {
      document.title = `${item.ItemName} - Kitchen Inventory`;
    } else {
      document.title = "Item Details - Kitchen Inventory";
    }
  }, [item, isEditing]);

  if (isLoading) {
    return (
      <DetailContainer>
        <p role="status">Loading item details...</p>
      </DetailContainer>
    );
  }

  if (error) {
    return (
      <DetailContainer>
        <p role="alert">Error: {error}</p>
        <p>
          <StyledLink to="/">Back to Inventory</StyledLink>
        </p>
      </DetailContainer>
    );
  }

  if (!id || !item) {
    return (
      <DetailContainer>
        <h2>Item not found</h2>
        <p>The requested item could not be found.</p>
        <p>
          <StyledLink to="/">Back to Inventory</StyledLink>
        </p>
      </DetailContainer>
    );
  }

  const onArchiveClick = async () => {
    if (item.Status === "archived") {
      await unarchiveItem(item.id);
    } else {
      await archiveItem(item.id);
    }
  };

  const onDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const onDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    await deleteItem(item.id);
    navigate("/");
  };

  const onDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <DetailContainer>
      {/* Breadcrumb navigation */}
      <BreadcrumbNav aria-label="Breadcrumb">
        <ol>
          <li>
            <StyledLink to="/">Inventory</StyledLink>
          </li>
          <li aria-current="page">{item.ItemName}</li>
        </ol>
      </BreadcrumbNav>

      {/* Item header */}
      <ItemHeader>
        <h2>{item.ItemName}</h2>
        <p>
          {item.Brand} &mdash; {item.Category} / {item.SubCategory}
        </p>
      </ItemHeader>

      {/* Item actions */}
      <ActionsNav aria-label="Item actions">
        <menu>
          <li>
            <button type="button" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          </li>
          <li>
            <button type="button" onClick={onArchiveClick}>
              {item.Status === "archived" ? "Unarchive" : "Archive"}
            </button>
          </li>
          <li>
            <button type="button" onClick={onDeleteClick}>
              Delete
            </button>
          </li>
        </menu>
      </ActionsNav>

      {/* Edit dialog */}
      {isEditing && (
        <EditDialog onClose={() => setIsEditing(false)} item={item} />
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title={`Delete ${item.ItemName}?`}
          message={`Are you sure you want to delete ${item.ItemName}? This action cannot be undone.`}
          onConfirm={onDeleteConfirm}
          onCancel={onDeleteCancel}
        />
      )}

      {/* All fields details */}
      <FieldsSection aria-label="All Item Fields">
        <h3>All Item Fields</h3>
        <dl>
          {ALL_FIELDS.map(({ key, label }) => (
            <div key={key}>
              <dt style={{ textAlign: "left" }}>{label || key}</dt>
              <dd style={{ textAlign: "right" }}>{item[key] ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </FieldsSection>
    </DetailContainer>
  );
}

export default ItemDetailPage;
