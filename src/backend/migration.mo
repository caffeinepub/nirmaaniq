import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type OldUserProfile = {
    name : Text;
    email : Text;
    role : Text; // "Admin", "Site Engineer", "Project Manager"
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    nextProjectId : Nat;
    nextLogId : Nat;
  };

  type NewUserProfile = {
    fullName : Text;
    phone : Text;
    designation : Text;
    companyName : Text;
    role : StandardizedRole;
    assignedProject : ?Nat;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
    nextProjectId : Nat;
    nextLogId : Nat;
  };

  public type StandardizedRole = {
    #admin;
    #site_engineer;
    #project_manager;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          fullName = oldProfile.name;
          phone = "";
          designation = "";
          companyName = "";
          role = convertRole(oldProfile.role);
          assignedProject = null;
        };
      }
    );
    { old with userProfiles = newUserProfiles };
  };

  func convertRole(oldRole : Text) : StandardizedRole {
    switch (oldRole) {
      case ("Admin") { #admin };
      case ("Site Engineer") { #site_engineer };
      case ("Project Manager") { #project_manager };
      case ("site_engineer") { #site_engineer };
      case ("project_manager") { #project_manager };
      case ("admin") { #admin };
      case (_) { #site_engineer };
    };
  };
};
