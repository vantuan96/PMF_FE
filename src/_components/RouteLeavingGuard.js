import React, { useEffect, useState } from "react";
import { Prompt } from "react-router-dom";
import ConfirmBox from "./ConfirmBox";

export const RouteLeavingGuard = ({
  navigate,
  when,
  shouldBlockNavigation,
  yes,
  no,
  content
}) => {
  const [modalVisible, updateModalVisible] = useState(false);
  const [lastLocation, updateLastLocation] = useState();
  const [confirmedNavigation, updateConfirmedNavigation] = useState(false);

  const showModal = location => {
    updateModalVisible(true);
    updateLastLocation(location);
  };

  const closeModal = cb => {
    updateModalVisible(false);
    if (cb) {
      cb();
    }
  };

  const handleBlockedNavigation = nextLocation => {
    if (!confirmedNavigation && shouldBlockNavigation(nextLocation)) {
      showModal(nextLocation);
      return false;
    }
    return true;
  };
  const handleConfirmNavigationClick = () => {
    closeModal(() => {
      if (lastLocation) {
        updateConfirmedNavigation(true);
      }
    });
  };
  useEffect(() => {
    if (confirmedNavigation) {
      navigate(lastLocation.pathname);
      updateConfirmedNavigation(false);
    }
  // eslint-disable-next-line
  }, [confirmedNavigation]);

  return (
    <>
      <Prompt when={when} message={handleBlockedNavigation} />
      <ConfirmBox
        yes={'Đồng ý'}
        no={'Hủy'}
        visible={modalVisible}
        onCancel={closeModal}
        onConfirm={handleConfirmNavigationClick}
        className="prompt_guide"
      >
        <p className="main_text">{content}</p>
      </ConfirmBox>
    </>
  );
};

export default RouteLeavingGuard;
