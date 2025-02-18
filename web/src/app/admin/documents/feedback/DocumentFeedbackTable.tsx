import { BasicTable } from "@/components/admin/connectors/BasicTable";
import { PopupSpec, usePopup } from "@/components/admin/connectors/Popup";
import { useState } from "react";
import { PageSelector } from "@/components/PageSelector";
import { DocumentBoostStatus } from "@/lib/types";
import { updateBoost, updateHiddenStatus } from "../lib";
import { CheckmarkIcon, EditIcon } from "@/components/icons/icons";
import { numToDisplay } from "./constants";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { getErrorMsg } from "@/lib/fetchUtils";
import { HoverPopup } from "@/components/HoverPopup";
import { CustomCheckbox } from "@/components/CustomCheckbox";
import { ScoreSection } from "../ScoreEditor";

const IsVisibleSection = ({
  document,
  onUpdate,
}: {
  document: DocumentBoostStatus;
  onUpdate: (response: Response) => void;
}) => {
  return (
    <HoverPopup
      mainContent={
        document.hidden ? (
          <div
            onClick={async () => {
              const response = await updateHiddenStatus(
                document.document_id,
                false
              );
              onUpdate(response);
            }}
            className="flex text-red-700 cursor-pointer hover:bg-gray-700 py-1 px-2 w-fit rounded-full"
          >
            <div className="select-none">Hidden</div>
            <div className="ml-1 my-auto">
              <CustomCheckbox checked={false} />
            </div>
          </div>
        ) : (
          <div
            onClick={async () => {
              const response = await updateHiddenStatus(
                document.document_id,
                true
              );
              onUpdate(response);
            }}
            className="flex text-gray-400 cursor-pointer hover:bg-gray-700 py-1 px-2 w-fit rounded-full"
          >
            <div className="text-gray-400 my-auto select-none">Visible</div>
            <div className="ml-1 my-auto">
              <CustomCheckbox checked={true} />
            </div>
          </div>
        )
      }
      popupContent={
        <div className="text-xs text-gray-300">
          {document.hidden ? (
            <div className="flex">
              <FiEye className="my-auto mr-1" /> Unhide
            </div>
          ) : (
            <div className="flex">
              <FiEyeOff className="my-auto mr-1" />
              Hide
            </div>
          )}
        </div>
      }
      direction="left"
    />
  );
};

export const DocumentFeedbackTable = ({
  documents,
  refresh,
}: {
  documents: DocumentBoostStatus[];
  refresh: () => void;
}) => {
  const [page, setPage] = useState(1);
  const { popup, setPopup } = usePopup();

  return (
    <div>
      {popup}
      <BasicTable
        columns={[
          {
            header: "Document Name",
            key: "name",
          },
          {
            header: "Is Searchable?",
            key: "visible",
          },
          {
            header: "Score",
            key: "score",
            alignment: "right",
          },
        ]}
        data={documents
          .slice((page - 1) * numToDisplay, page * numToDisplay)
          .map((document) => {
            return {
              name: (
                <a
                  className="text-blue-600"
                  href={document.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {document.semantic_id}
                </a>
              ),
              visible: (
                <IsVisibleSection
                  document={document}
                  onUpdate={async (response) => {
                    if (response.ok) {
                      refresh();
                    } else {
                      setPopup({
                        message: `Error updating hidden status - ${getErrorMsg(
                          response
                        )}`,
                        type: "error",
                      });
                    }
                  }}
                />
              ),
              score: (
                <div className="ml-auto flex w-16">
                  <div key={document.document_id} className="h-10 ml-auto mr-8">
                    <ScoreSection
                      documentId={document.document_id}
                      initialScore={document.boost}
                      refresh={refresh}
                      setPopup={setPopup}
                    />
                  </div>
                </div>
              ),
            };
          })}
      />
      <div className="mt-3 flex">
        <div className="mx-auto">
          <PageSelector
            totalPages={Math.ceil(documents.length / numToDisplay)}
            currentPage={page}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </div>
  );
};
