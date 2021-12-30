public with sharing class emailsendapex {
    @AuraEnabled(cacheable=true)
        public static List<Account> sendEmail(string acctid)
        {
            List<Messaging.SingleEmailMessage> mails = new List<Messaging.SingleEmailMessage>();
         //   ID OwnerId ='';
         //  	List<User>users=new List<User>();
         // List<Account>acct=new List<Account>();
            List<ID>ownerids=new List<ID>();
            List<String> sendTo = new List<String>();
    //        List<String> ownername = new List<String>();
            Account acct=[select name,id,OwnerId, CreatedById, CreatedDate from Account where id =: acctid];
            system.debug(acct);
         //   if(acct.size()>0){              
            ownerids.add(acct.OwnerId);             
            user users=[select name,id,email from user where id in:ownerids];
   			system.debug('-------------users------'+users);
   			sendTo.add(users.Email);
        //    ownername.add(users.name); 
            /*if(users.size()>0){
     		for(User u:users){
    		 
    }
    }*/
       Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
     //mail.setReplyTo('pradeepreddy9168@gmail.com');
      mail.setSenderDisplayName('Account alert');

      mail.setSubject('Account notification');
      String body = 'Dear '+ users.Name +', ';
       body += 'Your have account '+ Acct.Name + 'was created on ' + Acct.CreatedDate;
   //   body + = 'Dear Account owner'+ Acct.Name;
      mail.setToAddresses(sendTo);
      mail.setHtmlBody(body);
      mails.add(mail);
      try{
      Messaging.sendEmail(mails);
          system.debug(mails);
      }
      catch(Exception e){
      system.debug('-------------exception------'+e);
       
      }
            return null;
    
}
}